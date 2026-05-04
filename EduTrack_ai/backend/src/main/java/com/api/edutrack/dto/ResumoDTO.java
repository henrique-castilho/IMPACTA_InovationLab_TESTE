package com.api.edutrack.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ResumoDTO {
    private Long totalDisciplinas;
    private String tarefasConcluidas; // formato: "43/83"
    private Integer tempoEstudo; // em horas (soma cargaHoraria)
    private Double progressoGeral; // em porcentagem (0-100)
}
