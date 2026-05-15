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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.api.edutrack.dto.AuthLoginRequestDTO;
import com.api.edutrack.dto.AuthCadastroRequestDTO;
import com.api.edutrack.dto.AuthResponseDTO;
import com.api.edutrack.dto.GoogleLoginRequestDTO;
import com.api.edutrack.dto.EsqueciSenhaDTO;
import com.api.edutrack.dto.ResetarSenhaDTO;
import com.api.edutrack.dto.VerificaCodigoDTO;
import com.api.edutrack.entity.SocialLogin;
import com.api.edutrack.entity.Usuario;
import com.api.edutrack.repository.SocialLoginRepository;
import com.api.edutrack.repository.UsuarioRepository;
import com.api.edutrack.security.JwtUtil;

import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final long TEMPO_EXPIRACAO_CODIGO_MINUTOS = 5;

    private final UsuarioRepository usuarioRepository;
    private final SocialLoginRepository socialLoginRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final GoogleOAuth2Service googleOAuth2Service;
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

        return new AuthResponseDTO(token, "Bearer", salvo.getId(), salvo.getNome(), salvo.getFotoUrl(), false);
    }

    public AuthResponseDTO login(AuthLoginRequestDTO request) {
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais invalidas"));

        // Se for uma conta social (sem senha), ou se a senha não bater, retornamos a mesma mensagem genérica
        if (usuario.getSenha() == null || usuario.getSenha().isBlank() || 
            !passwordEncoder.matches(request.getSenha(), usuario.getSenha())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais invalidas");
        }

        String token = jwtUtil.gerarToken(usuario.getEmail());
        return new AuthResponseDTO(token, "Bearer", usuario.getId(), usuario.getNome(), usuario.getFotoUrl(), false);
    }

    @Transactional
    public AuthResponseDTO loginComGoogle(GoogleLoginRequestDTO request) {
        var googleUser = googleOAuth2Service.obterUsuario(request.getAccessToken());

        SocialLogin socialLogin = socialLoginRepository
                .findByProviderAndProviderId("google", googleUser.id())
                .orElse(null);

        Usuario usuario;
        
        if (socialLogin != null) {
            usuario = socialLogin.getUsuario();
            if (usuario == null) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "Login social sem usuario vinculado");
            }
        } else {
            usuario = usuarioRepository.findByEmail(googleUser.email()).orElse(null);
            if (usuario == null) {
                usuario = Usuario.builder()
                        .nome(googleUser.name() != null && !googleUser.name().isBlank() ? googleUser.name() : "Usuario Google")
                        .email(googleUser.email())
                        .senha(null)
                        .fotoUrl(googleUser.picture())
                        .build();
                usuario = usuarioRepository.save(usuario);
            }

            SocialLogin novoSocialLogin = SocialLogin.builder()
                    .usuario(usuario)
                    .provider("google")
                    .providerId(googleUser.id())
                    .build();
            socialLoginRepository.save(novoSocialLogin);
        }

        // Se o usuário (novo ou existente) não tiver foto, mas o Google fornecer uma, vamos salvar
        if ((usuario.getFotoUrl() == null || usuario.getFotoUrl().isBlank()) && 
            googleUser.picture() != null && !googleUser.picture().isBlank()) {
            usuario.setFotoUrl(googleUser.picture());
            usuario = usuarioRepository.save(usuario);
        }

        String token = jwtUtil.gerarToken(usuario.getEmail());
        return new AuthResponseDTO(token, "Bearer", usuario.getId(), usuario.getNome(), usuario.getFotoUrl(), true);
    }

    public String gerarCodigoRecuperacao(EsqueciSenhaDTO request) {
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario nao encontrado"));

        if (usuario.getSenha() == null || usuario.getSenha().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Conta criada com Google nao possui senha para redefinir");
        }

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

        if (usuario.getSenha() == null || usuario.getSenha().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Conta criada com Google nao possui senha para redefinir");
        }

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
