package com.api.edutrack.service;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.api.edutrack.dto.UsuarioAtualizarRequestDTO;
import com.api.edutrack.entity.Usuario;
import com.api.edutrack.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public Usuario atualizarPerfil(Usuario usuario, UsuarioAtualizarRequestDTO dto) {
        boolean ehUsuarioSocial = (usuario.getSenha() == null || usuario.getSenha().isBlank());

        // Se for usuário Google, bloqueamos troca de e-mail e senha, mas permitimos o nome
        if (ehUsuarioSocial) {
            if (!usuario.getEmail().equals(dto.getEmail()) || (dto.getSenha() != null && !dto.getSenha().isBlank())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Contas vinculadas ao Google podem alterar apenas o nome de exibição.");
            }
        } else {
            // Para usuários normais, validamos o e-mail se houver alteração
            if (!usuario.getEmail().equals(dto.getEmail()) && usuarioRepository.existsByEmail(dto.getEmail())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Email já cadastrado");
            }
            usuario.setEmail(dto.getEmail());
            if (dto.getSenha() != null && !dto.getSenha().isBlank()) {
                usuario.setSenha(passwordEncoder.encode(dto.getSenha()));
            }
        }

        // Nome pode ser alterado por qualquer tipo de usuário
        usuario.setNome(dto.getNome());

        return usuarioRepository.save(usuario);
    }

    public Usuario salvar(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }

    public void excluirUsuario(Usuario usuario) {
        usuarioRepository.delete(usuario);
    }
}
