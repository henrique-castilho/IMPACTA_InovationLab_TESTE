package com.api.edutrack.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class DisciplinaResponseDTO {
    private Long id;
    private String nome;
    private String professor;
    private Integer cargaHoraria;
    private String descricao;
    private LocalDate dataInicio;
    private LocalDate dataFim;
}
