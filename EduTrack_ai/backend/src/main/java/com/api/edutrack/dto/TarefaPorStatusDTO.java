package com.api.edutrack.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TarefaPorStatusDTO {
    private Long disciplinaId;
    private String nomeDisciplina;
    private Long totalTarefas;
    private Long tarefasConcluidas;
}
