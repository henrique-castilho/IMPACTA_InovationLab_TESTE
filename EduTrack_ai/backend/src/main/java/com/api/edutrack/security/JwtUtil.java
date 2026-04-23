package com.api.edutrack.security;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtUtil {

    @Value("${jwt.segredo:edutrack-segredo-super-seguro-com-no-minimo-32-bytes}")
    private String segredoJwt;

    @Value("${jwt.expiracao-ms:86400000}")
    private long expiracaoMs;

    public String gerarToken(String email) {
        Instant agora = Instant.now();
        Instant expiracao = agora.plusMillis(expiracaoMs);

        return Jwts.builder()
                .subject(email)
                .issuedAt(Date.from(agora))
                .expiration(Date.from(expiracao))
                .signWith(obterChaveAssinatura())
                .compact();
    }

    public boolean validarToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(obterChaveAssinatura())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (Exception ex) {
            return false;
        }
    }

    public String extrairEmail(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(obterChaveAssinatura())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.getSubject();
    }

    private SecretKey obterChaveAssinatura() {
        return Keys.hmacShaKeyFor(segredoJwt.getBytes(StandardCharsets.UTF_8));
    }
}
