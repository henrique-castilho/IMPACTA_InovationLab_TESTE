package com.api.edutrack.dto;

import com.api.edutrack.enums.TipoInsight;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InsightDTO {
    private String titulo;
    private String descricao;
    private TipoInsight tipo;
}
