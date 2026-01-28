package com.innersignature.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Schema(description = "페이지네이션 응답")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PagedResponse<T> {
    @Schema(description = "실제 데이터 리스트")
    private List<T> content;        // 실제 데이터 리스트
    
    @Schema(description = "현재 페이지 번호 (1부터 시작)", example = "1")
    private int page;               // 현재 페이지 번호 (1부터 시작)
    
    @Schema(description = "페이지 크기", example = "10")
    private int size;               // 페이지 크기
    
    @Schema(description = "전체 데이터 개수", example = "100")
    private long totalElements;     // 전체 데이터 개수
    
    @Schema(description = "전체 페이지 수", example = "10")
    private int totalPages;         // 전체 페이지 수
}

