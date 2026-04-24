package com.api.edutrack.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResetarSenhaDTO {

    @NotBlank(message = "Email e obrigatorio")
    @Email(message = "Email invalido")
    private String email;

    @NotBlank(message = "Codigo e obrigatorio")
    @Pattern(regexp = "\\d{6}", message = "Codigo deve conter 6 digitos")
    private String codigo;

    @NotBlank(message = "Nova senha e obrigatoria")
    @Size(min = 6, max = 100, message = "Senha deve ter entre 6 e 100 caracteres")
    private String novaSenha;

    @NotBlank(message = "Confirmar senha e obrigatorio")
    @Size(min = 6, max = 100, message = "Senha deve ter entre 6 e 100 caracteres")
    private String confirmarSenha;
}