package com.api.edutrack.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EsqueciSenhaDTO {

    @NotBlank(message = "Email e obrigatorio")
    @Email(message = "Email invalido")
    private String email;
}