package com.api.edutrack.service;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Service
public class GoogleOAuth2Service {

	private static final String USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

	private final RestTemplate restTemplate = new RestTemplate();

	public GoogleUserInfo obterUsuario(String accessToken) {
		if (!StringUtils.hasText(accessToken)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Access token do Google e obrigatorio");
		}

		HttpHeaders headers = new HttpHeaders();
		headers.setBearerAuth(accessToken);

		try {
			ResponseEntity<GoogleUserInfoResponse> response = restTemplate.exchange(
					USERINFO_URL,
					HttpMethod.GET,
					new HttpEntity<>(headers),
					GoogleUserInfoResponse.class);

			GoogleUserInfoResponse body = response.getBody();
			if (body == null || !StringUtils.hasText(body.id()) || !StringUtils.hasText(body.email())) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
						"Nao foi possivel obter os dados do usuario no Google");
			}

			return new GoogleUserInfo(body.id(), body.email(), body.name(), body.picture());
		} catch (HttpClientErrorException ex) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
					"Access token do Google invalido ou expirado");
		} catch (ResponseStatusException ex) {
			throw ex;
		} catch (Exception ex) {
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
					"Erro ao consultar o Google: " + ex.getMessage());
		}
	}

	public record GoogleUserInfo(String id, String email, String name, String picture) {
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	private record GoogleUserInfoResponse(String id, String email, String name, String picture) {
	}
}