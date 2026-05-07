package com.api.edutrack.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DisciplinaRequestDTO {
    @NotBlank(message = "Nome e obrigatorio")
    @Size(max = 120, message = "Nome deve ter no maximo 120 caracteres")
    private String nome;

    @NotBlank(message = "Professor e obrigatorio")
    @Size(max = 120, message = "Nome do professor deve ter no maximo 120 caracteres")
    private String professor;

    @NotNull(message = "Carga horaria e obrigatoria")
    @Positive(message = "Carga horaria deve ser maior que zero")
    private Integer cargaHoraria;

    @NotBlank(message = "Descricao e obrigatoria")
    @Size(max = 1000, message = "Descricao deve ter no maximo 1000 caracteres")
    private String descricao;

    @NotNull(message = "Data de inicio e obrigatoria")
    private LocalDate dataInicio;

    @NotNull(message = "Data de fim e obrigatoria")
    private LocalDate dataFim;
}
