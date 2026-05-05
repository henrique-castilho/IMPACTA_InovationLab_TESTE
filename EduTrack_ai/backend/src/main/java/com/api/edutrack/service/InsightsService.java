
package com.api.edutrack.service;

import java.text.Normalizer;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.api.edutrack.dto.InsightDTO;
import com.api.edutrack.dto.InsightsResumoDTO;
import com.api.edutrack.dto.InsightsResponseDTO;
import com.api.edutrack.entity.Disciplina;
import com.api.edutrack.entity.Tarefa;
import com.api.edutrack.entity.Usuario;
import com.api.edutrack.enums.StatusTarefa;
import com.api.edutrack.enums.TipoInsight;
import com.api.edutrack.repository.DisciplinaRepository;
import com.api.edutrack.repository.TarefaRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.json.JsonMapper;
import com.google.genai.Client;
import com.google.genai.types.GenerateContentConfig;
import com.google.genai.types.GenerateContentResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class InsightsService {

    private static final int MIN_INSIGHTS = 3;
    private static final int MAX_INSIGHTS = 5;

    private final DisciplinaRepository disciplinaRepository;
    private final TarefaRepository tarefaRepository;
    private final ObjectMapper objectMapper = JsonMapper.builder().findAndAddModules().build();

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Value("${gemini.model:gemini-2.5-flash}")
    private String geminiModel;

    @Transactional(readOnly = true)
    public InsightsResponseDTO gerarInsights(Usuario usuario) {
        List<Disciplina> disciplinas = disciplinaRepository.findByUsuario(usuario, Pageable.unpaged()).getContent();
        List<Tarefa> tarefas = tarefaRepository.findByDisciplinaUsuario(usuario, Pageable.unpaged()).getContent();

        if (geminiApiKey == null || geminiApiKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Chave da IA nao configurada. Defina gemini.api.key ou GOOGLE_API_KEY.");
        }

        String prompt = montarPrompt(disciplinas, tarefas);
        List<InsightDTO> insights = gerarComGemini(prompt);

        insights = normalizarQuantidade(insights, tarefas);

        InsightsResumoDTO resumo = new InsightsResumoDTO(
                contarTipo(insights, TipoInsight.POSITIVO),
                contarTipo(insights, TipoInsight.ALERTA),
                contarTipo(insights, TipoInsight.SUGESTAO));

        return new InsightsResponseDTO(resumo, insights);
    }

    private List<InsightDTO> gerarComGemini(String prompt) {
        try {
            Client client = Client.builder().apiKey(geminiApiKey).build();

            GenerateContentConfig config = GenerateContentConfig.builder()
                    .responseMimeType("application/json")
                    .candidateCount(1)
                    .build();

            GenerateContentResponse response = client.models.generateContent(geminiModel, prompt, config);
            String text = response.text();

            if (text == null || text.isBlank()) {
                throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                        "A IA nao retornou conteudo para gerar os insights.");
            }

            return extrairInsights(text);
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            String message = ex.getMessage() == null ? "" : ex.getMessage().toLowerCase(Locale.ROOT);
            if (message.contains("quota") || message.contains("429") || message.contains("resource_exhausted")) {
                throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                        "Cota da IA excedida no momento. Tente novamente em instantes.");
            }

            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Falha ao consultar a IA para gerar insights.");
        }
    }

    private List<InsightDTO> extrairInsights(String rawText) {
        List<InsightDTO> resultado = new ArrayList<>();
        try {
            String json = limparJson(rawText);
            JsonNode root = objectMapper.readTree(json);

            JsonNode insightsNode = root.has("insights") ? root.get("insights") : root;
            if (!insightsNode.isArray()) {
                return resultado;
            }

            for (JsonNode item : insightsNode) {
                String titulo = asText(item, "titulo");
                String descricao = asText(item, "descricao");
                TipoInsight tipo = parseTipo(asText(item, "tipo"));

                if (!titulo.isBlank() && !descricao.isBlank() && tipo != null) {
                    resultado.add(new InsightDTO(titulo, descricao, tipo));
                }
            }
        } catch (Exception ignored) {
            return resultado;
        }
        return resultado;
    }

    private String montarPrompt(List<Disciplina> disciplinas, List<Tarefa> tarefas) {
        StringBuilder sb = new StringBuilder();
        sb.append("Voce e um tutor academico. Analise os dados do estudante e gere insights em portugues brasileiro.\n");
        sb.append("Regras obrigatorias:\n");
        sb.append("1) Retorne somente JSON valido, sem markdown.\n");
        sb.append("2) O JSON deve ter o campo insights (array).\n");
        sb.append("3) Cada item deve ter titulo, descricao e tipo.\n");
        sb.append("4) tipo deve ser um entre: POSITIVO, ALERTA, SUGESTAO.\n");
        sb.append("5) Gere entre 3 e 5 insights focados no progresso academico.\n\n");

        sb.append("Formato esperado:\n");
        sb.append("{\"insights\":[{\"titulo\":\"...\",\"descricao\":\"...\",\"tipo\":\"ALERTA\"}]}\n\n");

        sb.append("Disciplinas do estudante:\n");
        if (disciplinas.isEmpty()) {
            sb.append("- Nenhuma disciplina cadastrada\n");
        } else {
            disciplinas.forEach(d -> sb.append("- ")
                    .append(d.getNome())
                    .append(" | professor: ").append(d.getProfessor())
                    .append(" | carga horaria: ").append(d.getCargaHoraria()).append("h\n"));
        }

        sb.append("\nTarefas do estudante:\n");
        if (tarefas.isEmpty()) {
            sb.append("- Nenhuma tarefa cadastrada\n");
        } else {
            tarefas.stream()
                    .sorted(Comparator.comparing(Tarefa::getDataEntrega, Comparator.nullsLast(Comparator.naturalOrder())))
                    .forEach(t -> {
                        long dias = t.getDataEntrega() == null
                                ? 999
                                : ChronoUnit.DAYS.between(LocalDate.now(), t.getDataEntrega());

                        sb.append("- ")
                                .append(t.getTitulo())
                                .append(" | disciplina: ").append(t.getDisciplina().getNome())
                                .append(" | status: ").append(t.getStatus())
                                .append(" | prazo: ").append(t.getDataEntrega())
                                .append(" | dias para entrega: ").append(dias)
                                .append("\n");
                    });
        }

        return sb.toString();
    }

    private List<InsightDTO> normalizarQuantidade(List<InsightDTO> insights, List<Tarefa> tarefas) {
        List<InsightDTO> normalizados = new ArrayList<>(insights == null ? List.of() : insights);

        if (normalizados.size() > MAX_INSIGHTS) {
            normalizados = new ArrayList<>(normalizados.subList(0, MAX_INSIGHTS));
        }

        if (normalizados.size() < MIN_INSIGHTS) {
            normalizados.addAll(gerarFallbackInsights(tarefas));
        }

        if (normalizados.size() > MAX_INSIGHTS) {
            normalizados = new ArrayList<>(normalizados.subList(0, MAX_INSIGHTS));
        }

        return normalizados;
    }

    private List<InsightDTO> gerarFallbackInsights(List<Tarefa> tarefas) {
        List<InsightDTO> fallback = new ArrayList<>();

        long atrasadas = tarefas.stream()
                .filter(t -> t.getDataEntrega() != null)
                .filter(t -> ChronoUnit.DAYS.between(LocalDate.now(), t.getDataEntrega()) < 0)
                .count();

        long concluidas = tarefas.stream()
                .filter(t -> t.getStatus() == StatusTarefa.CONCLUIDA)
                .count();

        long total = tarefas.size();

        fallback.add(new InsightDTO(
                "Resumo de progresso",
                total == 0
                        ? "Cadastre disciplinas e tarefas para receber analises mais precisas da IA."
                        : "Voce concluiu " + concluidas + " de " + total + " tarefas cadastradas.",
                TipoInsight.POSITIVO));

        fallback.add(new InsightDTO(
                "Atencao aos prazos",
                atrasadas > 0
                        ? "Existem " + atrasadas + " tarefas atrasadas. Priorize-as para recuperar o ritmo academico."
                        : "Nao ha tarefas atrasadas no momento. Continue mantendo esse controle de prazos.",
                TipoInsight.ALERTA));

        fallback.add(new InsightDTO(
                "Proxima acao sugerida",
                "Separe um bloco de estudo para as tarefas com prazo mais proximo e reduza o risco de atrasos.",
                TipoInsight.SUGESTAO));

        return fallback;
    }

    private int contarTipo(List<InsightDTO> insights, TipoInsight tipo) {
        return (int) insights.stream().filter(i -> i.getTipo() == tipo).count();
    }

    private String limparJson(String raw) {
        String cleaned = raw.trim();
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replace("```json", "").replace("```", "").trim();
        }
        return cleaned;
    }

    private String asText(JsonNode node, String field) {
        JsonNode value = node.get(field);
        return value == null || value.isNull() ? "" : value.asText("").trim();
    }

    private TipoInsight parseTipo(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }

        String normalized = Normalizer.normalize(raw, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                .toUpperCase(Locale.ROOT)
                .trim();

        return switch (normalized) {
            case "POSITIVO" -> TipoInsight.POSITIVO;
            case "ALERTA" -> TipoInsight.ALERTA;
            case "SUGESTAO", "SUGESTOES", "SUGESTION" -> TipoInsight.SUGESTAO;
            default -> null;
        };
    }
}

