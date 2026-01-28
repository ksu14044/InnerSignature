package com.innersignature.backend.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;

/**
 * OpenAPI (Swagger) 설정
 */
@Configuration
public class OpenApiConfig {
    
    @Value("${server.port:8080}")
    private String serverPort;
    
    @Bean
    public OpenAPI customOpenAPI() {
        List<Server> servers = new ArrayList<>();
        
        // 개발 환경 서버
        servers.add(new Server()
                .url("http://localhost:" + serverPort)
                .description("로컬 개발 서버"));
        
        // 운영 환경 서버는 환경변수로 설정 가능
        String prodUrl = System.getenv("API_SERVER_URL");
        if (prodUrl != null && !prodUrl.isEmpty()) {
            servers.add(new Server()
                    .url(prodUrl)
                    .description("운영 서버"));
        }
        
        return new OpenAPI()
                .servers(servers)
                .info(new Info()
                        .title("InnerSignature API")
                        .version("1.0.0")
                        .description("""
                                지출결의서 관리 시스템 API 문서
                                
                                ## 주요 기능
                                - 사용자 인증 및 권한 관리
                                - 지출결의서 작성 및 결재
                                - 회사 및 구독 관리
                                - 세무 처리 및 통계
                                
                                ## 인증
                                대부분의 API는 JWT Bearer 토큰 인증이 필요합니다.
                                로그인 API를 통해 토큰을 발급받은 후, 상단의 'Authorize' 버튼을 클릭하여 토큰을 입력하세요.
                                """)
                        .contact(new Contact()
                                .name("InnerSignature Team")
                                .email("support@innersignature.com"))
                        .license(new License()
                                .name("MIT")
                                .url("https://opensource.org/licenses/MIT")))
                .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
                .components(new Components()
                        .addSecuritySchemes("Bearer Authentication",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("JWT 토큰을 입력하세요. 형식: Bearer {token}")));
    }
}

