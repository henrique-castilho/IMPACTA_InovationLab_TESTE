package com.api.edutrack.service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.api.edutrack.dto.DisciplinaDashboardDTO;
import com.api.edutrack.dto.DisciplinaGraficoDTO;
import com.api.edutrack.dto.ResumoDTO;
import com.api.edutrack.dto.TarefaPorStatusDTO;
import com.api.edutrack.dto.TarefaPrioritariaDTO;
import com.api.edutrack.entity.Disciplina;
import com.api.edutrack.entity.Tarefa;
import com.api.edutrack.entity.Usuario;
import com.api.edutrack.repository.DisciplinaRepository;
import com.api.edutrack.repository.TarefaRepository;

@Service
public class DashboardService {

    @Autowired
    private DisciplinaRepository disciplinaRepository;

    @Autowired
    private TarefaRepository tarefaRepository;

    /**
     * Endpoint 1: GET /dashboard/resumo
     * Retorna totalDisciplinas, tarefasConcluidas (43/83), tempoEstudo e progressoGeral (%)
     */
    @Transactional(readOnly = true)
    public ResumoDTO obterResumo(Usuario usuario) {
        long totalDisciplinas = disciplinaRepository.countByUsuario(usuario);
        long tarefasConcluidasTotal = tarefaRepository.countTarefasConcluidas(usuario);
        long tarefasTotalCount = tarefaRepository.countTarefasTotal(usuario);
        Integer tempoEstudo = disciplinaRepository.sumCargaHorariaByUsuario(usuario);
        if (tempoEstudo == null) {
            tempoEstudo = 0;
        }

        // Calcular progresso geral (%)
        Double progressoGeral = tarefasTotalCount == 0 ? 0.0 : (tarefasConcluidasTotal * 100.0) / tarefasTotalCount;

        String tarefasConcluidas = tarefasConcluidasTotal + "/" + tarefasTotalCount;

        return new ResumoDTO(totalDisciplinas, tarefasConcluidas, tempoEstudo, progressoGeral);
    }

    /**
     * Endpoint 2: GET /dashboard/graficos/disciplinas
     * Retorna lista de disciplinas com cargaHoraria e porcentagem de tarefas concluídas
     */
    @Transactional(readOnly = true)
    public List<DisciplinaGraficoDTO> obterGraficosDisciplinas(Usuario usuario) {
        Page<Disciplina> disciplinas = disciplinaRepository.findByUsuario(usuario, Pageable.unpaged());
        return disciplinas.getContent().stream()
                .map(this::convertToDisciplinaGraficoDTO)
                .collect(Collectors.toList());
    }

    /**
     * Endpoint 3: GET /dashboard/graficos/tarefas-por-status
     * Retorna lista de disciplinas com totalTarefas e tarefasConcluidas
     */
    @Transactional(readOnly = true)
    public List<TarefaPorStatusDTO> obterGraficosTarefasPorStatus(Usuario usuario) {
        Page<Disciplina> disciplinas = disciplinaRepository.findByUsuario(usuario, Pageable.unpaged());
        return disciplinas.getContent().stream()
                .map(this::convertToTarefaPorStatusDTO)
                .collect(Collectors.toList());
    }

    /**
     * Endpoint 4: GET /dashboard/disciplinas
     * Retorna página de disciplinas com dados para cards (6 por página)
     */
    @Transactional(readOnly = true)
    public Page<DisciplinaDashboardDTO> obterDisciplinasDashboard(Usuario usuario, Pageable pageable) {
        Page<Disciplina> disciplinas = disciplinaRepository.findByUsuario(usuario, pageable);
        List<DisciplinaDashboardDTO> dtos = disciplinas.getContent().stream()
                .map(this::convertToDisciplinaDashboardDTO)
                .collect(Collectors.toList());
        return new PageImpl<>(dtos, pageable, disciplinas.getTotalElements());
    }

    /**
     * Endpoint 5: GET /dashboard/tarefas-prioritarias
     * Retorna página de tarefas não concluídas ordenadas por prioridade e prazo (4 por página)
     * Opcionalmente filtrar por disciplinaId
     */
    @Transactional(readOnly = true)
    public Page<TarefaPrioritariaDTO> obterTarefasPrioritarias(Usuario usuario, Long disciplinaId, Pageable pageable) {
        List<Tarefa> tarefas;
        if (disciplinaId != null) {
            // Filtrado por disciplina
            tarefas = tarefaRepository.findByDisciplinaIdAndStatusIn(disciplinaId);
        } else {
            // Todas as tarefas não concluídas do usuário
            tarefas = tarefaRepository.findByDisciplinaUsuarioAndStatusIn(usuario);
        }

        // Converter para DTO e ordenar por prioridade + prazo
        List<TarefaPrioritariaDTO> dtos = tarefas.stream()
                .map(this::convertToTarefaPrioritariaDTO)
                .sorted((a, b) -> {
                    int priorA = prioridadeOrdem(a.getPrioridade());
                    int priorB = prioridadeOrdem(b.getPrioridade());
                    if (priorA != priorB) return Integer.compare(priorA, priorB);
                    // Se mesma prioridade, ordenar por prazo (menor primeiro)
                    return extrairDias(a.getPrazo()).compareTo(extrairDias(b.getPrazo()));
                })
                .collect(Collectors.toList());

        // Paginar manualmente
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), dtos.size());
        List<TarefaPrioritariaDTO> pageContent = start > end ? List.of() : dtos.subList(start, end);
        return new PageImpl<>(pageContent, pageable, dtos.size());
    }

    // ============ MÉTODOS AUXILIARES ============

    private DisciplinaGraficoDTO convertToDisciplinaGraficoDTO(Disciplina disciplina) {
        long concluidas = tarefaRepository.countTarefasConcluidasByDisciplina(disciplina);
        long total = tarefaRepository.countTarefasTotalByDisciplina(disciplina);
        Double porcentagem = total == 0 ? 0.0 : (concluidas * 100.0) / total;
        return new DisciplinaGraficoDTO(disciplina.getId(), disciplina.getNome(), disciplina.getCargaHoraria(), porcentagem);
    }

    private TarefaPorStatusDTO convertToTarefaPorStatusDTO(Disciplina disciplina) {
        long concluidas = tarefaRepository.countTarefasConcluidasByDisciplina(disciplina);
        long total = tarefaRepository.countTarefasTotalByDisciplina(disciplina);
        return new TarefaPorStatusDTO(disciplina.getId(), disciplina.getNome(), total, concluidas);
    }

    private DisciplinaDashboardDTO convertToDisciplinaDashboardDTO(Disciplina disciplina) {
        long concluidas = tarefaRepository.countTarefasConcluidasByDisciplina(disciplina);
        long total = tarefaRepository.countTarefasTotalByDisciplina(disciplina);
        Double porcentagem = total == 0 ? 0.0 : (concluidas * 100.0) / total;
        String tarefas = concluidas + "/" + total;
        return new DisciplinaDashboardDTO(
                disciplina.getId(),
                disciplina.getNome(),
                disciplina.getProfessor(),
                tarefas,
                disciplina.getCargaHoraria(),
                porcentagem
        );
    }

    private TarefaPrioritariaDTO convertToTarefaPrioritariaDTO(Tarefa tarefa) {
        String prioridade = calcularPrioridade(tarefa.getDataEntrega());
        String prazo = calcularPrazoTexto(tarefa.getDataEntrega());
        return new TarefaPrioritariaDTO(
                tarefa.getId(),
                tarefa.getTitulo(),
                tarefa.getDisciplina().getNome(),
                prioridade,
                prazo
        );
    }

    private String calcularPrioridade(LocalDate dataEntrega) {
        if (dataEntrega == null) return "BAIXA";
        long dias = ChronoUnit.DAYS.between(LocalDate.now(), dataEntrega);
        if (dias < 0) return "ATRASADA";
        if (dias < 2) return "ALTA";
        if (dias <= 7) return "MEDIA";
        return "BAIXA";
    }

    private String calcularPrazoTexto(LocalDate dataEntrega) {
        if (dataEntrega == null) return "Sem prazo";
        long dias = ChronoUnit.DAYS.between(LocalDate.now(), dataEntrega);
        if (dias < 0) {
            long vencidos = Math.abs(dias);
            return "Venceu há " + vencidos + (vencidos == 1 ? " dia" : " dias");
        }
        if (dias == 0) return "Hoje";
        if (dias == 1) return "Amanhã";
        return dias + " dias";
    }

    private int prioridadeOrdem(String prioridade) {
        return switch (prioridade) {
            case "ATRASADA" -> 0;
            case "ALTA" -> 1;
            case "MEDIA" -> 2;
            case "BAIXA" -> 3;
            default -> 4;
        };
    }

    private Long extrairDias(String prazo) {
        if (prazo == null) return Long.MAX_VALUE;
        if (prazo.startsWith("Venceu há")) {
            // formato: "Venceu há X dias" ou "Venceu há 1 dia"
            try {
                String[] parts = prazo.split(" ");
                long v = Long.parseLong(parts[2]);
                return -v;
            } catch (Exception e) {
                return -1L;
            }
        }
        if (prazo.contains("Atrasada")) return -1L;
        if (prazo.equals("Hoje")) return 0L;
        if (prazo.equals("Amanhã")) return 1L;
        if (prazo.contains("dias")) {
            String[] parts = prazo.split(" ");
            return Long.parseLong(parts[0]);
        }
        return Long.MAX_VALUE;
    }
}
