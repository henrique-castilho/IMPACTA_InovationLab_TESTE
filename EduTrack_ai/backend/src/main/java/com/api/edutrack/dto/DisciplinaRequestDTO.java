package com.api.edutrack.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DisciplinaRequestDTO {
    @NotBlank(message = "Nome e obrigatorio")
    private String nome;

    @NotBlank(message = "Professor e obrigatorio")
    private String professor;

    @NotNull(message = "Carga horaria e obrigatoria")
    @Positive(message = "Carga horaria deve ser maior que zero")
    private Integer cargaHoraria;

    @NotBlank(message = "Descricao e obrigatoria")
    private String descricao;

    @NotNull(message = "Data de inicio e obrigatoria")
    private LocalDate dataInicio;

    @NotNull(message = "Data de fim e obrigatoria")
    private LocalDate dataFim;
}
