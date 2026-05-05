package com.api.edutrack.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.api.edutrack.dto.InsightsResponseDTO;
import com.api.edutrack.entity.Usuario;
import com.api.edutrack.service.InsightsService;
import com.api.edutrack.service.UsuarioAutenticadoService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/insights")
@Validated
@RequiredArgsConstructor
public class InsightsController {

    private final InsightsService insightsService;
    private final UsuarioAutenticadoService usuarioAutenticadoService;

    @PostMapping("/generate")
    public ResponseEntity<InsightsResponseDTO> gerarInsights() {
        Usuario usuario = usuarioAutenticadoService.obterUsuarioLogado();
        return ResponseEntity.ok(insightsService.gerarInsights(usuario));
    }
}
