package com.api.edutrack.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UsuarioMeResponseDTO {

    private Long id;
    private String nome;
    private String email;
    private String fotoUrl;
    private String senha;
    private boolean ehSocial;

    public UsuarioMeResponseDTO(Long id, String nome, String email, String fotoUrl, boolean ehSocial) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.fotoUrl = fotoUrl;
        this.ehSocial = ehSocial;
        this.senha = "*******";
    }

    public String getSenha() {
        return senha;
    }
}
