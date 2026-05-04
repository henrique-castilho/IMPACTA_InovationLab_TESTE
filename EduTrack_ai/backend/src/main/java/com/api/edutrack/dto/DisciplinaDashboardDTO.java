package com.api.edutrack.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class DisciplinaDashboardDTO {
    private Long id;
    private String nome;
    private String professor;
    private String tarefas; // formato: "12/17" (concluídas/total)
    private Integer cargaHoraria;
    private Double porcentagemConclusao; // 0-100
}
