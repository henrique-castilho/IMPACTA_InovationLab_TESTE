package com.api.edutrack.exception;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;

import com.api.edutrack.dto.RespostaErroDTO;

import io.swagger.v3.oas.annotations.Hidden;

@Hidden
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<RespostaErroDTO> tratarErrosValidacao(MethodArgumentNotValidException ex) {
        Map<String, String> erros = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(erro -> erros.put(erro.getField(), erro.getDefaultMessage()));

        String mensagem = "Erro de validacao nos campos informados";

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
            .body(new RespostaErroDTO(HttpStatus.BAD_REQUEST.value(), mensagem, erros));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<RespostaErroDTO> tratarResponseStatusException(ResponseStatusException ex) {
        String mensagem = ex.getReason() != null ? ex.getReason() : "Erro na requisicao";

        return ResponseEntity
                .status(ex.getStatusCode())
                .body(new RespostaErroDTO(ex.getStatusCode().value(), mensagem));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<RespostaErroDTO> tratarTipoInvalido(MethodArgumentTypeMismatchException ex) {
        String mensagem = "Tipo de parametro invalido: " + ex.getName();

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new RespostaErroDTO(HttpStatus.BAD_REQUEST.value(), mensagem));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<RespostaErroDTO> tratarJsonInvalido(HttpMessageNotReadableException ex) {
        String mensagem = "JSON invalido na requisicao";

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new RespostaErroDTO(HttpStatus.BAD_REQUEST.value(), mensagem));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<RespostaErroDTO> tratarErroGenerico(Exception ex) {
        String mensagem = "Erro interno no servidor";

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new RespostaErroDTO(HttpStatus.INTERNAL_SERVER_ERROR.value(), mensagem));
    }
}
