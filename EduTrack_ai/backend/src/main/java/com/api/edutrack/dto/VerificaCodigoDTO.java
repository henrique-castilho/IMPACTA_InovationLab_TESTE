package com.api.edutrack.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VerificaCodigoDTO {

    @NotBlank(message = "Email e obrigatorio")
    @Email(message = "Email invalido")
    private String email;

    @NotBlank(message = "Codigo e obrigatorio")
    @Pattern(regexp = "\\d{6}", message = "Codigo deve conter 6 digitos")
    private String codigo;
}