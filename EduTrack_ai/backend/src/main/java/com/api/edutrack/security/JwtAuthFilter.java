package com.api.edutrack.security;

import java.io.IOException;
import java.util.Collections;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.api.edutrack.repository.UsuarioRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UsuarioRepository usuarioRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest requisicao,
                                    HttpServletResponse resposta,
                                    FilterChain cadeiaFiltros) throws ServletException, IOException {
        String cabecalhoAutorizacao = requisicao.getHeader("Authorization");

        if (cabecalhoAutorizacao == null || !cabecalhoAutorizacao.startsWith("Bearer ")) {
            cadeiaFiltros.doFilter(requisicao, resposta);
            return;
        }

        String token = cabecalhoAutorizacao.substring(7);

        if (!jwtUtil.validarToken(token)) {
            cadeiaFiltros.doFilter(requisicao, resposta);
            return;
        }

        String email = jwtUtil.extrairEmail(token);

        if (email != null
                && SecurityContextHolder.getContext().getAuthentication() == null
                && usuarioRepository.findByEmail(email).isPresent()) {
            UsernamePasswordAuthenticationToken autenticacao = new UsernamePasswordAuthenticationToken(
                    email,
                    null,
                    Collections.emptyList()
            );
            autenticacao.setDetails(new WebAuthenticationDetailsSource().buildDetails(requisicao));
            SecurityContextHolder.getContext().setAuthentication(autenticacao);
        }

        cadeiaFiltros.doFilter(requisicao, resposta);
    }
}
