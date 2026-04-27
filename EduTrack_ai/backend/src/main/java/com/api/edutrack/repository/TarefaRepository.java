package com.api.edutrack.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.api.edutrack.entity.Tarefa;
import com.api.edutrack.entity.Disciplina;

public interface TarefaRepository extends JpaRepository<Tarefa, Long> {
    List<Tarefa> findByDisciplina(Disciplina disciplina);
    void deleteByDisciplina(Disciplina disciplina);
}
