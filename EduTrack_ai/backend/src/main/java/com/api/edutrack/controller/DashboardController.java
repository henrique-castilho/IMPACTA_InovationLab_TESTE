package com.api.edutrack.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.api.edutrack.dto.DisciplinaDashboardDTO;
import com.api.edutrack.dto.DisciplinaGraficoDTO;
import com.api.edutrack.dto.ResumoDTO;
import com.api.edutrack.dto.TarefaPorStatusDTO;
import com.api.edutrack.dto.TarefaPrioritariaDTO;
import com.api.edutrack.entity.Usuario;
import com.api.edutrack.service.DashboardService;
import com.api.edutrack.service.UsuarioAutenticadoService;

@RestController
@RequestMapping("/dashboard")
@Validated
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @Autowired
    private UsuarioAutenticadoService usuarioAutenticadoService;

    @GetMapping("/resumo")
    public ResponseEntity<ResumoDTO> obterResumo() {
        Usuario usuario = usuarioAutenticadoService.obterUsuarioLogado();
        return ResponseEntity.ok(dashboardService.obterResumo(usuario));
    }

    @GetMapping("/graficos/disciplinas")
    public ResponseEntity<List<DisciplinaGraficoDTO>> obterGraficosDisciplinas() {
        Usuario usuario = usuarioAutenticadoService.obterUsuarioLogado();
        return ResponseEntity.ok(dashboardService.obterGraficosDisciplinas(usuario));
    }


    @GetMapping("/graficos/tarefas-por-status")
    public ResponseEntity<List<TarefaPorStatusDTO>> obterGraficosTarefasPorStatus() {
        Usuario usuario = usuarioAutenticadoService.obterUsuarioLogado();
        return ResponseEntity.ok(dashboardService.obterGraficosTarefasPorStatus(usuario));
    }

    /**
     * Endpoint 4: GET /dashboard/disciplinas
     * Retorna página de disciplinas com dados para cards (6 por página por padrão)
     */
    @GetMapping("/disciplinas")
    public ResponseEntity<Page<DisciplinaDashboardDTO>> obterDisciplinasDashboard(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size) {
        Usuario usuario = usuarioAutenticadoService.obterUsuarioLogado();
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(dashboardService.obterDisciplinasDashboard(usuario, pageable));
    }

    /**
     * Endpoint 5: GET /dashboard/tarefas-prioritarias
     * Retorna página de tarefas não concluídas ordenadas por prioridade e prazo
     * Pode filtrar por disciplinaId via query param
     * Paginação padrão: 4 por página
     */
    @GetMapping("/tarefas-prioritarias")
    public ResponseEntity<Page<TarefaPrioritariaDTO>> obterTarefasPrioritarias(
            @RequestParam(required = false) Long disciplinaId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "4") int size) {
        Usuario usuario = usuarioAutenticadoService.obterUsuarioLogado();
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(dashboardService.obterTarefasPrioritarias(usuario, disciplinaId, pageable));
    }
}
