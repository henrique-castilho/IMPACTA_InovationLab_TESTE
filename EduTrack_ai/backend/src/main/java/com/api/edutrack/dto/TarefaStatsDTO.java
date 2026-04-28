package com.api.edutrack.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TarefaStatsDTO {
    private long totalPendentes;
    private long totalEmAndamento;
    private long totalConcluidas;
}
