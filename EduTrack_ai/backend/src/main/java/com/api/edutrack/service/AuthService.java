package com.api.edutrack.service;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.api.edutrack.dto.AuthLoginRequestDTO;
import com.api.edutrack.dto.AuthCadastroRequestDTO;
import com.api.edutrack.dto.AuthResponseDTO;
import com.api.edutrack.dto.EsqueciSenhaDTO;
import com.api.edutrack.dto.ResetarSenhaDTO;
import com.api.edutrack.dto.VerificaCodigoDTO;
import com.api.edutrack.entity.Usuario;
import com.api.edutrack.repository.UsuarioRepository;
import com.api.edutrack.security.JwtUtil;

import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final long TEMPO_EXPIRACAO_CODIGO_MINUTOS = 5;

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final ConcurrentHashMap<String, CodigoRecuperacao> codigosRecuperacao = new ConcurrentHashMap<>();
    private final SecureRandom random = new SecureRandom();
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();

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

        return new AuthResponseDTO(token, "Bearer", salvo.getId());
    }

    public AuthResponseDTO login(AuthLoginRequestDTO request) {
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais invalidas"));
        
        if (!passwordEncoder.matches(request.getSenha(), usuario.getSenha())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais invalidas");
        }

        String token = jwtUtil.gerarToken(usuario.getEmail());
        return new AuthResponseDTO(token, "Bearer", usuario.getId());
    }

    public String gerarCodigoRecuperacao(EsqueciSenhaDTO request) {
        usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario nao encontrado"));

        String codigo = String.format("%06d", random.nextInt(1_000_000));
        Instant expiraEm = Instant.now().plus(TEMPO_EXPIRACAO_CODIGO_MINUTOS, ChronoUnit.MINUTES);

        codigosRecuperacao.put(request.getEmail(), new CodigoRecuperacao(codigo, expiraEm));
        agendarExpiracao(request.getEmail(), codigo);

        return codigo;
    }

    public void verificarCodigoRecuperacao(VerificaCodigoDTO request) {
        validarCodigoRecuperacao(request.getEmail(), request.getCodigo());
    }

    public void resetarSenha(ResetarSenhaDTO request) {
        if (!request.getNovaSenha().equals(request.getConfirmarSenha())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nova senha e confirmar senha devem ser iguais");
        }

        validarCodigoRecuperacao(request.getEmail(), request.getCodigo());

        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario nao encontrado"));

        if (passwordEncoder.matches(request.getNovaSenha(), usuario.getSenha())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nova senha nao pode ser igual a senha atual");
        }

        usuario.setSenha(passwordEncoder.encode(request.getNovaSenha()));
        usuarioRepository.save(usuario);

        codigosRecuperacao.remove(request.getEmail());
    }

    private void validarCodigoRecuperacao(String email, String codigo) {
        CodigoRecuperacao codigoRecuperacao = codigosRecuperacao.get(email);
        if (codigoRecuperacao == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Codigo invalido ou expirado");
        }

        if (Instant.now().isAfter(codigoRecuperacao.expiraEm())) {
            codigosRecuperacao.remove(email);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Codigo invalido ou expirado");
        }

        if (!codigoRecuperacao.codigo().equals(codigo)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Codigo invalido ou expirado");
        }
    }

    private void agendarExpiracao(String email, String codigo) {
        scheduler.schedule(() -> codigosRecuperacao.compute(email, (chave, valorAtual) -> {
            if (valorAtual != null && valorAtual.codigo().equals(codigo)) {
                return null;
            }
            return valorAtual;
        }), TEMPO_EXPIRACAO_CODIGO_MINUTOS, TimeUnit.MINUTES);
    }

    @PreDestroy
    public void fecharScheduler() {
        scheduler.shutdownNow();
    }

    private record CodigoRecuperacao(String codigo, Instant expiraEm) {
    }
}
