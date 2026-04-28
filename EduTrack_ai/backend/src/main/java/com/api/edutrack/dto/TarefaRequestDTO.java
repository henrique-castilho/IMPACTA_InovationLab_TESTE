package com.api.edutrack.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TarefaRequestDTO {
    @NotNull(message = "DisciplinaId e obrigatorio")
    private Long disciplinaId;

    @NotBlank(message = "Titulo e obrigatorio")
    private String titulo;

    @NotBlank(message = "Descricao e obrigatoria")
    private String descricao;

    @NotNull(message = "Data de entrega e obrigatoria")
    private LocalDate dataEntrega;

    @NotNull(message = "Status e obrigatorio")
    private com.api.edutrack.enums.StatusTarefa status;
}
