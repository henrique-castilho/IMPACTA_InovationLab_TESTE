package com.api.edutrack.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AuthResponseDTO {
    private String token;
    private String tipo;
    private Long userId;
    private String nome;
    private String fotoUrl;
    private boolean ehSocial;
}
