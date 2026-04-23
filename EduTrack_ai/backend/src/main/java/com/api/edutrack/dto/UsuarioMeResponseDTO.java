package com.api.edutrack.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UsuarioMeResponseDTO {

    private Long id;
    private String nome;
    private String email;
}
