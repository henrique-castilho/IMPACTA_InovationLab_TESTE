package com.api.edutrack.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GoogleLoginRequestDTO {

	@NotBlank(message = "Access token e obrigatorio")
	private String accessToken;
}