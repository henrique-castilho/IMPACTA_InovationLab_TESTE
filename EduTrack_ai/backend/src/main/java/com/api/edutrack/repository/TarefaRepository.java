package com.api.edutrack.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.api.edutrack.entity.Tarefa;
import com.api.edutrack.entity.Disciplina;
import com.api.edutrack.entity.Usuario;
import com.api.edutrack.enums.StatusTarefa;

public interface TarefaRepository extends JpaRepository<Tarefa, Long> {
    List<Tarefa> findByDisciplina(Disciplina disciplina);
    void deleteByDisciplina(Disciplina disciplina);

    Page<Tarefa> findByDisciplinaUsuario(Usuario usuario, Pageable pageable);

    Page<Tarefa> findByDisciplinaUsuarioAndDisciplinaId(Usuario usuario, Long disciplinaId, Pageable pageable);

    Page<Tarefa> findByDisciplinaUsuarioAndStatus(Usuario usuario, StatusTarefa status, Pageable pageable);

    Page<Tarefa> findByDisciplinaUsuarioAndDisciplinaIdAndStatus(Usuario usuario, Long disciplinaId, StatusTarefa status, Pageable pageable);

    java.util.Optional<Tarefa> findByIdAndDisciplinaUsuario(Long id, Usuario usuario);

    long countByDisciplinaUsuarioAndStatus(Usuario usuario, StatusTarefa status);
}
