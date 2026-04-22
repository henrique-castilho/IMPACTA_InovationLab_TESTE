package com.api.edutrack.dto;

import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class RespostaErroDTO {

    private int status;
    private String mensagem;
    private Map<String, String> detalhes;

    public RespostaErroDTO(int status, String mensagem) {
        this.status = status;
        this.mensagem = mensagem;
        this.detalhes = null;
    }
}
