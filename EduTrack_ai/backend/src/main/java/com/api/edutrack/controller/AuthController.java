package com.api.edutrack.controller;

import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

import com.api.edutrack.dto.AuthLoginRequestDTO;
import com.api.edutrack.dto.AuthCadastroRequestDTO;
import com.api.edutrack.dto.AuthResponseDTO;
import com.api.edutrack.dto.EsqueciSenhaDTO;
import com.api.edutrack.dto.ResetarSenhaDTO;
import com.api.edutrack.dto.VerificaCodigoDTO;
import com.api.edutrack.service.AuthService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Validated
public class AuthController {

    private final AuthService authService;

    @PostMapping("/cadastro")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponseDTO cadastro(@Valid @RequestBody AuthCadastroRequestDTO request) {
        return authService.cadastro(request);
    }

    @PostMapping("/login")
    public AuthResponseDTO login(@Valid @RequestBody AuthLoginRequestDTO request) {
        return authService.login(request);
    }

    @PostMapping("/esqueci-senha")
    public Map<String, String> esqueciSenha(@Valid @RequestBody EsqueciSenhaDTO request) {
        String codigo = authService.gerarCodigoRecuperacao(request);
        return Map.of("mensagem", "Codigo de recuperacao gerado com sucesso", "codigo", codigo);
    }

    @PostMapping("/verificar-codigo")
    public Map<String, String> verificarCodigo(@Valid @RequestBody VerificaCodigoDTO request) {
        authService.verificarCodigoRecuperacao(request);
        return Map.of("mensagem", "Codigo valido");
    }

    @PostMapping("/reseta-senha")
    public Map<String, String> resetaSenha(@Valid @RequestBody ResetarSenhaDTO request) {
        authService.resetarSenha(request);
        return Map.of("mensagem", "Senha atualizada com sucesso");
    }
}
