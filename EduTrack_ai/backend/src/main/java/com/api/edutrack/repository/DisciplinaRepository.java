package com.api.edutrack.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.api.edutrack.entity.Disciplina;
import com.api.edutrack.entity.Usuario;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;

public interface DisciplinaRepository extends JpaRepository<Disciplina, Long> {

    Optional<Disciplina> findByIdAndUsuario(Long id, Usuario usuario);

    Page<Disciplina> findByUsuarioAndNomeContainingIgnoreCaseOrUsuarioAndProfessorContainingIgnoreCaseOrUsuarioAndDescricaoContainingIgnoreCase(
        Usuario usuario1, String nome,
        Usuario usuario2, String professor,
        Usuario usuario3, String descricao,
        Pageable pageable
    );

    Page<Disciplina> findByUsuario(Usuario usuario, Pageable pageable);
}
