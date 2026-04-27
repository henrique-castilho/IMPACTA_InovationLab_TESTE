package com.api.edutrack.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.api.edutrack.entity.Disciplina;
import com.api.edutrack.entity.Usuario;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DisciplinaRepository extends JpaRepository<Disciplina, Long> {

    Optional<Disciplina> findByIdAndUsuario(Long id, Usuario usuario);

    Page<Disciplina> findByUsuarioAndNomeContainingIgnoreCaseOrUsuarioAndProfessorContainingIgnoreCaseOrUsuarioAndDescricaoContainingIgnoreCase(
        Usuario usuario1, String nome,
        Usuario usuario2, String professor,
        Usuario usuario3, String descricao,
        Pageable pageable
    );

    Page<Disciplina> findByUsuario(Usuario usuario, Pageable pageable);

    long countByUsuario(Usuario usuario);

    @Query("SELECT COALESCE(SUM(d.cargaHoraria), 0) FROM Disciplina d WHERE d.usuario = :usuario")
    Integer sumCargaHorariaByUsuario(@Param("usuario") Usuario usuario);
}
