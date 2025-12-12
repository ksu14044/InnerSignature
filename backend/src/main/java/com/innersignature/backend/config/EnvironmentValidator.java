package com.innersignature.backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

/**
 * 프로덕션 환경 필수 환경변수 검증
 */
@Component
public class EnvironmentValidator {

    private static final Logger logger = LoggerFactory.getLogger(EnvironmentValidator.class);
    private final Environment environment;

    public EnvironmentValidator(Environment environment) {
        this.environment = environment;
    }

    @jakarta.annotation.PostConstruct
    public void validate() {
        List<String> activeProfiles = Arrays.asList(environment.getActiveProfiles());
        if (!activeProfiles.contains("prod")) {
            // 개발 환경은 패스
            return;
        }

        validateRequired("DB_USERNAME");
        validateRequired("DB_PASSWORD");
        validateRequired("JWT_SECRET");
        validateRequired("FILE_UPLOAD_BASE_DIR");
    }

    private void validateRequired(String key) {
        String value = System.getenv(key);
        if (value == null || value.isEmpty()) {
            logger.error("필수 환경변수 누락: {}", key);
            throw new IllegalStateException("필수 환경변수가 설정되지 않았습니다: " + key);
        }
    }
}

