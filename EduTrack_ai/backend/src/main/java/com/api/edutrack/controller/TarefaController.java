package com.api.edutrack.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import com.api.edutrack.dto.TarefaRequestDTO;
import com.api.edutrack.dto.TarefaResponseDTO;
import com.api.edutrack.dto.TarefaStatsDTO;
import com.api.edutrack.entity.Usuario;
import com.api.edutrack.enums.StatusTarefa;
import com.api.edutrack.service.TarefaService;
import com.api.edutrack.service.UsuarioAutenticadoService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/tarefas")
@Validated
public class TarefaController {

    @Autowired
    private TarefaService tarefaService;

    @Autowired
    private UsuarioAutenticadoService usuarioAutenticadoService;

    @GetMapping
    public ResponseEntity<Page<TarefaResponseDTO>> listar(
            @RequestParam(required = false) Long disciplinaId,
            @RequestParam(required = false) StatusTarefa status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size) {
        Usuario usuario = usuarioAutenticadoService.obterUsuarioLogado();
        Pageable pageable = PageRequest.of(page, size);
        Page<TarefaResponseDTO> result = tarefaService.listarTarefas(usuario, disciplinaId, status, pageable);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/estatisticas")
    public ResponseEntity<TarefaStatsDTO> estatisticas() {
        Usuario usuario = usuarioAutenticadoService.obterUsuarioLogado();
        return ResponseEntity.ok(tarefaService.estatisticas(usuario));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TarefaResponseDTO> buscar(@PathVariable Long id) {
        Usuario usuario = usuarioAutenticadoService.obterUsuarioLogado();
        return ResponseEntity.ok(tarefaService.buscarPorId(usuario, id));
    }

    @PostMapping
    public ResponseEntity<TarefaResponseDTO> criar(@Valid @RequestBody TarefaRequestDTO dto) {
        Usuario usuario = usuarioAutenticadoService.obterUsuarioLogado();
        TarefaResponseDTO created = tarefaService.criarTarefa(usuario, dto);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TarefaResponseDTO> atualizar(@PathVariable Long id, @Valid @RequestBody TarefaRequestDTO dto) {
        Usuario usuario = usuarioAutenticadoService.obterUsuarioLogado();
        return ResponseEntity.ok(tarefaService.atualizarTarefa(usuario, id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        Usuario usuario = usuarioAutenticadoService.obterUsuarioLogado();
        tarefaService.deletarTarefa(usuario, id);
        return ResponseEntity.noContent().build();
    }
}
