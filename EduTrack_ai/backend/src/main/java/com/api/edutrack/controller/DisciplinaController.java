package com.api.edutrack.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.api.edutrack.dto.DisciplinaRequestDTO;
import com.api.edutrack.dto.DisciplinaResponseDTO;
import com.api.edutrack.dto.DisciplinaResumoDTO;
import com.api.edutrack.entity.Usuario;
import com.api.edutrack.service.DisciplinaService;
import com.api.edutrack.service.UsuarioAutenticadoService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/disciplinas")
@RequiredArgsConstructor
@Validated
public class DisciplinaController {
    private final DisciplinaService disciplinaService;
    private final UsuarioAutenticadoService usuarioAutenticadoService;

    @PostMapping
    public DisciplinaResponseDTO criar(@Valid @RequestBody DisciplinaRequestDTO dto) {
        Usuario usuario = usuarioAutenticadoService.obterUsuarioLogado();
        return disciplinaService.criar(usuario, dto);
    }

    @GetMapping
    public Page<DisciplinaResponseDTO> listar(@RequestParam(required = false) String search, Pageable pageable) {
        Usuario usuario = usuarioAutenticadoService.obterUsuarioLogado();
        return disciplinaService.listar(usuario, search, pageable);
    }

    @GetMapping("/resumo")
    public DisciplinaResumoDTO resumo() {
        Usuario usuario = usuarioAutenticadoService.obterUsuarioLogado();
        return disciplinaService.resumo(usuario);
    }

    @PutMapping("/{id}")
    public DisciplinaResponseDTO atualizar(@PathVariable Long id, @Valid @RequestBody DisciplinaRequestDTO dto) {
        Usuario usuario = usuarioAutenticadoService.obterUsuarioLogado();
        return disciplinaService.atualizar(id, usuario, dto);
    }

    @DeleteMapping("/{id}")
    public void excluir(@PathVariable Long id) {
        Usuario usuario = usuarioAutenticadoService.obterUsuarioLogado();
        disciplinaService.excluir(id, usuario);
    }
}
