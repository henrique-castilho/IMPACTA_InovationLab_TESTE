package com.api.edutrack.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TarefaPrioritariaDTO {
    private Long id;
    private String titulo;
    private String nomeDisciplina;
    private String prioridade; // ALTA, MEDIA, BAIXA, ATRASADA
    private String prazo; // "hoje", "amanha", "2 dias", "5 dias", etc.
}
