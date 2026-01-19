package com.innersignature.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.concurrent.Executor;

/**
 * 비동기 처리 설정
 * SecurityContext를 비동기 스레드에 전파합니다.
 */
@Configuration
@EnableAsync
public class AsyncConfig implements AsyncConfigurer {

    @Override
    @Bean(name = "taskExecutor")
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("async-");
        
        // SecurityContext 전파를 위한 래퍼
        executor.setTaskDecorator(runnable -> {
            SecurityContext context = SecurityContextHolder.getContext();
            return () -> {
                try {
                    // SecurityContext 복사본 생성 및 설정
                    SecurityContext copiedContext = SecurityContextHolder.createEmptyContext();
                    if (context != null && context.getAuthentication() != null) {
                        copiedContext.setAuthentication(context.getAuthentication());
                    }
                    SecurityContextHolder.setContext(copiedContext);
                    runnable.run();
                } finally {
                    SecurityContextHolder.clearContext();
                }
            };
        });
        
        executor.initialize();
        return executor;
    }
}

