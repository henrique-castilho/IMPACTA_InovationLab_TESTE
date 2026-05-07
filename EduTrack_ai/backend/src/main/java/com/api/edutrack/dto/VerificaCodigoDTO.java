package com.api.edutrack.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VerificaCodigoDTO {

    @NotBlank(message = "Email e obrigatorio")
    @Email(message = "Email invalido")
    @Size(max = 180, message = "Email deve ter no maximo 180 caracteres")
    private String email;

    @NotBlank(message = "Codigo e obrigatorio")
    @Pattern(regexp = "\\d{6}", message = "Codigo deve conter 6 digitos")
    private String codigo;
}