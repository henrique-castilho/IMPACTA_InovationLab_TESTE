package com.api.edutrack.service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.api.edutrack.dto.TarefaRequestDTO;
import com.api.edutrack.dto.TarefaResponseDTO;
import com.api.edutrack.dto.TarefaStatsDTO;
import com.api.edutrack.entity.Disciplina;
import com.api.edutrack.entity.Tarefa;
import com.api.edutrack.entity.Usuario;
import com.api.edutrack.enums.StatusTarefa;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import com.api.edutrack.repository.DisciplinaRepository;
import com.api.edutrack.repository.TarefaRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TarefaService {

    @Autowired
    private TarefaRepository tarefaRepository;

    @Autowired
    private DisciplinaRepository disciplinaRepository;
    @Transactional(readOnly = true)
    public Page<TarefaResponseDTO> listarTarefas(Usuario usuario, Long disciplinaId, StatusTarefa status, boolean atrasadas, Pageable pageable) {
        LocalDate hoje = LocalDate.now();

        if (atrasadas) {
            Page<Tarefa> pagina = disciplinaId != null
                ? tarefaRepository.findAtrasadasByUsuarioAndDisciplinaId(usuario, disciplinaId, hoje, pageable)
                : tarefaRepository.findAtrasadasByUsuario(usuario, hoje, pageable);
            return pagina.map(this::toDTO);
        }

        List<Tarefa> tarefas;
        if (disciplinaId != null && status != null) {
            tarefas = tarefaRepository.findByDisciplinaUsuarioAndDisciplinaIdAndStatus(usuario, disciplinaId, status, Pageable.unpaged()).getContent();
        } else if (disciplinaId != null) {
            tarefas = tarefaRepository.findByDisciplinaUsuarioAndDisciplinaId(usuario, disciplinaId, Pageable.unpaged()).getContent();
        } else if (status != null) {
            tarefas = tarefaRepository.findByDisciplinaUsuarioAndStatus(usuario, status, Pageable.unpaged()).getContent();
        } else {
            tarefas = tarefaRepository.findByDisciplinaUsuario(usuario, Pageable.unpaged()).getContent();
        }

        List<TarefaResponseDTO> dtos = tarefas.stream()
            .map(this::toDTO)
            .sorted((a, b) -> {
                int ordemA = prioridadeOrdem(a.getPrioridade());
                int ordemB = prioridadeOrdem(b.getPrioridade());
                if (ordemA != ordemB) return Integer.compare(ordemA, ordemB);
                return a.getDataEntrega().compareTo(b.getDataEntrega());
            })
            .collect(Collectors.toList());

        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), dtos.size());
        List<TarefaResponseDTO> pageContent = start > end ? List.of() : dtos.subList(start, end);
        return new PageImpl<>(pageContent, pageable, dtos.size());
    }

    private int prioridadeOrdem(String prioridade) {
        if (prioridade == null) return 4; // CONCLUIDA (sem prioridade) vai por último
        return switch (prioridade) {
            case "ATRASADA" -> 0; // primeiro: atrasadas
            case "ALTA"     -> 1; // segundo: próximas do prazo (< 2 dias)
            case "MEDIA"    -> 2; // terceiro: prazo em até 7 dias
            case "BAIXA"    -> 3; // quarto: prazo confortável
            default         -> 4;
        };
    }

    @Transactional
    public TarefaResponseDTO criarTarefa(Usuario usuario, TarefaRequestDTO dto) {
        Disciplina d = disciplinaRepository.findById(dto.getDisciplinaId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Disciplina nao encontrada"));
        if (!d.getUsuario().getId().equals(usuario.getId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Disciplina nao pertence ao usuario");
        }
        Tarefa t = new Tarefa();
        t.setTitulo(dto.getTitulo());
        t.setDescricao(dto.getDescricao());
        t.setDataEntrega(dto.getDataEntrega());
        t.setStatus(dto.getStatus());
        t.setDisciplina(d);
        Tarefa saved = tarefaRepository.save(t);
        return toDTO(saved);
    }

    @Transactional
    public TarefaResponseDTO atualizarTarefa(Usuario usuario, Long id, TarefaRequestDTO dto) {
        Tarefa t = tarefaRepository.findByIdAndDisciplinaUsuario(id, usuario)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tarefa nao encontrada"));
        if (!t.getDisciplina().getId().equals(dto.getDisciplinaId())) {
                Disciplina d = disciplinaRepository.findById(dto.getDisciplinaId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Disciplina nao encontrada"));
            if (!d.getUsuario().getId().equals(usuario.getId())) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Disciplina nao pertence ao usuario");
            }
            t.setDisciplina(d);
        }
        t.setTitulo(dto.getTitulo());
        t.setDescricao(dto.getDescricao());
        t.setDataEntrega(dto.getDataEntrega());
        t.setStatus(dto.getStatus());
        Tarefa updated = tarefaRepository.save(t);
        return toDTO(updated);
    }

    @Transactional
    public void deletarTarefa(Usuario usuario, Long id) {
        Tarefa t = tarefaRepository.findByIdAndDisciplinaUsuario(id, usuario)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tarefa nao encontrada"));
        tarefaRepository.delete(t);
    }

    @Transactional(readOnly = true)
    public TarefaStatsDTO estatisticas(Usuario usuario) {
        long pendentes = tarefaRepository.countByDisciplinaUsuarioAndStatus(usuario, StatusTarefa.PENDENTE);
        long andamento = tarefaRepository.countByDisciplinaUsuarioAndStatus(usuario, StatusTarefa.EM_ANDAMENTO);
        long concluidas = tarefaRepository.countByDisciplinaUsuarioAndStatus(usuario, StatusTarefa.CONCLUIDA);
        return new TarefaStatsDTO(pendentes, andamento, concluidas);
    }

    private TarefaResponseDTO toDTO(Tarefa t) {
        String prioridade = calcularPrioridade(t.getDataEntrega(), t.getStatus());
        return new TarefaResponseDTO(t.getId(), t.getTitulo(), t.getDescricao(), t.getDataEntrega(), t.getStatus().name(), t.getDisciplina().getId(), t.getDisciplina().getNome(), prioridade);
    }

    private String calcularPrioridade(LocalDate dataEntrega, StatusTarefa status) {
        if (status == StatusTarefa.CONCLUIDA) return null;
        if (dataEntrega == null) return "BAIXA";
        
        long dias = ChronoUnit.DAYS.between(LocalDate.now(), dataEntrega);
        if (dias < 0) return "ATRASADA";
        if (dias < 2) return "ALTA";
        if (dias <= 7) return "MEDIA";
        return "BAIXA";
    }
}
