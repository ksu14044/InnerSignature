package com.innersignature.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;

@Schema(description = "API 응답 공통 포맷")
@Data
@AllArgsConstructor // 모든 필드를 채우는 생성자 자동 생성
public class ApiResponse<T> {
    @Schema(description = "성공 여부", example = "true")
    private boolean success;    // 성공 여부 (true/false)
    
    @Schema(description = "응답 메시지", example = "조회 성공")
    private String message;     // 메시지 ("조회 성공")
    
    @Schema(description = "응답 데이터 (제네릭 타입)")
    private T data;             // 실제 데이터 (List가 들어갈 수도, 객체가 들어갈 수도 있음)
}