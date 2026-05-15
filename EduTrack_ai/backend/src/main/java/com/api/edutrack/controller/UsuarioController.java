package com.api.edutrack.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.api.edutrack.dto.UsuarioMeResponseDTO;
import com.api.edutrack.dto.UsuarioAtualizarRequestDTO;
import com.api.edutrack.entity.Usuario;
import com.api.edutrack.service.UsuarioAutenticadoService;
import com.api.edutrack.service.UsuarioService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Validated
public class UsuarioController {

    private final UsuarioAutenticadoService usuarioAutenticadoService;
    private final UsuarioService usuarioService;

    @GetMapping("/me")
    public UsuarioMeResponseDTO me() {
        Usuario usuario = usuarioAutenticadoService.obterUsuarioLogado();
        return new UsuarioMeResponseDTO(usuario.getId(), usuario.getNome(), usuario.getEmail(), usuario.getFotoUrl());
    }

    @PutMapping("/me")
    public ResponseEntity<?> atualizarPerfil(@Validated @RequestBody UsuarioAtualizarRequestDTO dto) {
        Usuario usuario = usuarioAutenticadoService.obterUsuarioLogado();
        boolean emailAlterado = !usuario.getEmail().equals(dto.getEmail());
        boolean senhaAlterada = dto.getSenha() != null && !dto.getSenha().isBlank();
        Usuario atualizado = usuarioService.atualizarPerfil(usuario, dto);
        boolean relogin = emailAlterado || senhaAlterada;
        return ResponseEntity.ok(
            java.util.Map.of(
                "usuario", new UsuarioMeResponseDTO(atualizado.getId(), atualizado.getNome(), atualizado.getEmail(), atualizado.getFotoUrl()),
                "relogin", relogin
            )
        );
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> excluirConta() {
        Usuario usuario = usuarioAutenticadoService.obterUsuarioLogado();
        usuarioService.excluirUsuario(usuario);
        return ResponseEntity.noContent().build();
    }
}
