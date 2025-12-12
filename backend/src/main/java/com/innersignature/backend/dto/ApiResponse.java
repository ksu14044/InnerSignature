package com.innersignature.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor // 모든 필드를 채우는 생성자 자동 생성
public class ApiResponse<T> {
    private boolean success;    // 성공 여부 (true/false)
    private String message;     // 메시지 ("조회 성공")
    private T data;             // 실제 데이터 (List가 들어갈 수도, 객체가 들어갈 수도 있음)
}