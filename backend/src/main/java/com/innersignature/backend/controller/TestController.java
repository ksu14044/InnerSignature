package com.innersignature.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/api/ping")
    public String ping() {
        return "Pong! (백엔드와 연결 성공)";
    }
}