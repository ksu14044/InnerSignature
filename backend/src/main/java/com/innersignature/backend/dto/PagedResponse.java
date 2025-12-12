package com.innersignature.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PagedResponse<T> {
    private List<T> content;        // 실제 데이터 리스트
    private int page;               // 현재 페이지 번호 (1부터 시작)
    private int size;               // 페이지 크기
    private long totalElements;     // 전체 데이터 개수
    private int totalPages;         // 전체 페이지 수
}

