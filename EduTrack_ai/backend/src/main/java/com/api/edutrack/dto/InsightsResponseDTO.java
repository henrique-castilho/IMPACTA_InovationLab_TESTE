package com.api.edutrack.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InsightsResponseDTO {
    private InsightsResumoDTO resumo;
    private List<InsightDTO> insights;
}
