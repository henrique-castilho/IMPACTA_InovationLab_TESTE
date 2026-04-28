package com.api.edutrack.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TarefaResponseDTO {
    private Long id;
    private String titulo;
    private String descricao;
    private LocalDate dataEntrega;
    private String status;
    private Long disciplinaId;
    private String nomeDisciplina;
    private String prioridade;
}
