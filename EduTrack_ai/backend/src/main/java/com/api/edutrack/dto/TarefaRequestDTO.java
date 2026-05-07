package com.api.edutrack.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TarefaRequestDTO {
    @NotNull(message = "DisciplinaId e obrigatorio")
    private Long disciplinaId;

    @NotBlank(message = "Titulo e obrigatorio")
    @Size(max = 150, message = "Titulo deve ter no maximo 150 caracteres")
    private String titulo;

    @NotBlank(message = "Descricao e obrigatoria")
    @Size(max = 2000, message = "Descricao deve ter no maximo 2000 caracteres")
    private String descricao;

    @NotNull(message = "Data de entrega e obrigatoria")
    private LocalDate dataEntrega;

    @NotNull(message = "Status e obrigatorio")
    private com.api.edutrack.enums.StatusTarefa status;
}
