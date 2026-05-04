package com.api.edutrack.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class DisciplinaGraficoDTO {
    private Long id;
    private String nome;
    private Integer cargaHoraria; // total de horas
    private Double porcentagemTarefasConcluidas; // porcentagem (0-100)
}
