package com.innersignature.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload.base-dir:uploads}")
    private String fileUploadBaseDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 프로젝트 루트의 uploads 디렉토리를 /api/uploads/** 경로로 서빙
        String projectRoot = System.getProperty("user.dir");
        String uploadPath = projectRoot + File.separator + fileUploadBaseDir;
        
        registry.addResourceHandler("/api/uploads/**")
                .addResourceLocations("file:" + uploadPath + File.separator)
                .setCachePeriod(3600); // 1시간 캐시
    }
}