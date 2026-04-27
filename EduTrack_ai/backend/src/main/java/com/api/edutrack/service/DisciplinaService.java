package com.api.edutrack.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.api.edutrack.dto.DisciplinaRequestDTO;
import com.api.edutrack.dto.DisciplinaResponseDTO;
import com.api.edutrack.entity.Disciplina;
import com.api.edutrack.entity.Usuario;
import com.api.edutrack.repository.DisciplinaRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DisciplinaService {
    private final DisciplinaRepository disciplinaRepository;

    public DisciplinaResponseDTO criar(Usuario usuario, DisciplinaRequestDTO dto) {
        validarRegras(dto);
        Disciplina disciplina = Disciplina.builder()
            .nome(dto.getNome())
            .professor(dto.getProfessor())
            .cargaHoraria(dto.getCargaHoraria())
            .descricao(dto.getDescricao())
            .dataInicio(dto.getDataInicio())
            .dataFim(dto.getDataFim())
            .usuario(usuario)
            .build();
        disciplina = disciplinaRepository.save(disciplina);
        return toResponse(disciplina);
    }

    public Page<DisciplinaResponseDTO> listar(Usuario usuario, String search, Pageable pageable) {
        if (search != null && !search.isBlank()) {
            return disciplinaRepository
                .findByUsuarioAndNomeContainingIgnoreCaseOrUsuarioAndProfessorContainingIgnoreCaseOrUsuarioAndDescricaoContainingIgnoreCase(
                    usuario, search, usuario, search, usuario, search, pageable)
                .map(this::toResponse);
        }
        return disciplinaRepository.findByUsuario(usuario, pageable).map(this::toResponse);
    }

    public DisciplinaResponseDTO detalhar(Long id, Usuario usuario) {
        Disciplina disciplina = disciplinaRepository.findByIdAndUsuario(id, usuario)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Disciplina nao encontrada"));
        return toResponse(disciplina);
    }

    public DisciplinaResponseDTO atualizar(Long id, Usuario usuario, DisciplinaRequestDTO dto) {
        validarRegras(dto);
        Disciplina disciplina = disciplinaRepository.findByIdAndUsuario(id, usuario)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Disciplina nao encontrada"));
        disciplina.setNome(dto.getNome());
        disciplina.setProfessor(dto.getProfessor());
        disciplina.setCargaHoraria(dto.getCargaHoraria());
        disciplina.setDescricao(dto.getDescricao());
        disciplina.setDataInicio(dto.getDataInicio());
        disciplina.setDataFim(dto.getDataFim());
        disciplina = disciplinaRepository.save(disciplina);
        return toResponse(disciplina);
    }

    public void excluir(Long id, Usuario usuario) {
        Disciplina disciplina = disciplinaRepository.findByIdAndUsuario(id, usuario)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Disciplina nao encontrada"));
        disciplinaRepository.delete(disciplina);
    }

    private void validarRegras(DisciplinaRequestDTO dto) {
        if (dto.getDataFim().isBefore(dto.getDataInicio())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Data de fim deve ser maior ou igual a data de inicio");
        }
        if (dto.getCargaHoraria() == null || dto.getCargaHoraria() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Carga horaria deve ser maior que zero");
        }
    }

    private DisciplinaResponseDTO toResponse(Disciplina d) {
        return new DisciplinaResponseDTO(
            d.getId(), d.getNome(), d.getProfessor(), d.getCargaHoraria(), d.getDescricao(), d.getDataInicio(), d.getDataFim()
        );
    }

    public com.api.edutrack.dto.DisciplinaResumoDTO resumo(Usuario usuario) {
        long total = disciplinaRepository.countByUsuario(usuario);
        Integer soma = disciplinaRepository.sumCargaHorariaByUsuario(usuario);
        int carga = soma == null ? 0 : soma;
        return new com.api.edutrack.dto.DisciplinaResumoDTO(total, carga);
    }
}
