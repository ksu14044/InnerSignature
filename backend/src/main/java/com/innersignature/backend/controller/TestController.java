package com.innersignature.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Health", description = "헬스체크/연결 확인 API")
@RestController
public class TestController {

    @Operation(summary = "핑 확인", description = "서버/백엔드 연결 상태를 확인합니다.")
    @GetMapping("/api/ping")
    public String ping() {
        return "Pong! (백엔드와 연결 성공)";
    }
}