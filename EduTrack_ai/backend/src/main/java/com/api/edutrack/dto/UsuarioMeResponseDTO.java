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

    public UsuarioMeResponseDTO(Long id, String nome, String email, String fotoUrl) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.fotoUrl = fotoUrl;
        this.senha = "*******";
    }

    public String getSenha() {
        return senha;
    }
}
