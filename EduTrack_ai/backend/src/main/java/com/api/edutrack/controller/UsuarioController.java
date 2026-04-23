package com.api.edutrack.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.api.edutrack.dto.UsuarioMeResponseDTO;
import com.api.edutrack.entity.Usuario;
import com.api.edutrack.service.UsuarioAutenticadoService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioAutenticadoService usuarioAutenticadoService;

    @GetMapping("/me")
    public UsuarioMeResponseDTO me() {
        Usuario usuario = usuarioAutenticadoService.obterUsuarioLogado();
        return new UsuarioMeResponseDTO(usuario.getId(), usuario.getNome(), usuario.getEmail());
    }
}
