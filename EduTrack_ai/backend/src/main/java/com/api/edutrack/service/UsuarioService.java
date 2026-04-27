package com.api.edutrack.service;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.api.edutrack.dto.UsuarioAtualizarRequestDTO;
import com.api.edutrack.entity.Usuario;
import com.api.edutrack.repository.UsuarioRepository;
import com.api.edutrack.repository.DisciplinaRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final DisciplinaRepository disciplinaRepository;

    public Usuario atualizarPerfil(Usuario usuario, UsuarioAtualizarRequestDTO dto) {
        // Verifica unicidade de email
        if (!usuario.getEmail().equals(dto.getEmail()) && usuarioRepository.existsByEmail(dto.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email ja cadastrado");
        }
        usuario.setNome(dto.getNome());
        usuario.setEmail(dto.getEmail());
        if (dto.getSenha() != null && !dto.getSenha().isBlank()) {
            usuario.setSenha(passwordEncoder.encode(dto.getSenha()));
        }
        return usuarioRepository.save(usuario);
    }

    public void excluirUsuario(Usuario usuario) {
        // Exclui todas as disciplinas (em cascata apaga tarefas)
        disciplinaRepository.deleteByUsuario(usuario);
        usuarioRepository.delete(usuario);
    }
}
