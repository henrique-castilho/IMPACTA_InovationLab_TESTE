package com.api.edutrack.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.api.edutrack.entity.Disciplina;
import com.api.edutrack.entity.Usuario;

public interface DisciplinaRepository extends JpaRepository<Disciplina, Long> {
    List<Disciplina> findByUsuario(Usuario usuario);
    void deleteByUsuario(Usuario usuario);
}
