package com.api.edutrack.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InsightsResumoDTO {
    private int qtdPositivos;
    private int qtdAlertas;
    private int qtdSugestoes;
}
