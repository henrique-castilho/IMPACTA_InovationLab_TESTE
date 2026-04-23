package com.api.edutrack.service;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.api.edutrack.dto.AuthLoginRequestDTO;
import com.api.edutrack.dto.AuthCadastroRequestDTO;
import com.api.edutrack.dto.AuthResponseDTO;
import com.api.edutrack.entity.Usuario;
import com.api.edutrack.repository.UsuarioRepository;
import com.api.edutrack.security.JwtUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponseDTO cadastro(AuthCadastroRequestDTO request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email ja cadastrado");
        }

        Usuario usuario = Usuario.builder()
                .nome(request.getNome())
                .email(request.getEmail())
                .senha(passwordEncoder.encode(request.getSenha()))
                .build();

        Usuario salvo = usuarioRepository.save(usuario);
        String token = jwtUtil.gerarToken(salvo.getEmail());

        return new AuthResponseDTO(token, "Bearer");
    }

    public AuthResponseDTO login(AuthLoginRequestDTO request) {
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais invalidas"));
        
        if (!passwordEncoder.matches(request.getSenha(), usuario.getSenha())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais invalidas");
        }

        String token = jwtUtil.gerarToken(usuario.getEmail());
        return new AuthResponseDTO(token, "Bearer");
    }
}
