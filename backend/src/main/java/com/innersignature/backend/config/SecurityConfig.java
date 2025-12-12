package com.innersignature.backend.config;

import com.innersignature.backend.security.CustomAccessDeniedHandler;
import com.innersignature.backend.security.JwtAuthenticationEntryPoint;
import com.innersignature.backend.security.JwtAuthenticationFilter;
import com.innersignature.backend.security.RateLimitFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.security.web.header.writers.StaticHeadersWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final RateLimitFilter rateLimitFilter;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final CustomAccessDeniedHandler customAccessDeniedHandler;
    private final Environment environment;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // CSRF 보호 비활성화 (REST API용)
            .cors(cors -> cors.configurationSource(corsConfigurationSource())) // CORS 설정
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                .accessDeniedHandler(customAccessDeniedHandler)
            )
            .headers(headers -> headers
                .addHeaderWriter(new StaticHeadersWriter("X-Content-Type-Options", "nosniff"))
                .frameOptions(frame -> frame.deny())
                .addHeaderWriter(new StaticHeadersWriter("X-XSS-Protection", "1; mode=block"))
                .referrerPolicy(referrer -> referrer.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.NO_REFERRER))
                .httpStrictTransportSecurity(hsts -> hsts.disable()) // HTTP 환경 지원, HTTPS에서만 활성 고려
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS) // 세션 사용 안 함 (토큰 기반)
            )
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/register", "/api/login").permitAll() // 회원가입, 로그인 허용
                .requestMatchers("/api/refresh-token", "/api/logout").permitAll() // 토큰 재발급, 로그아웃 허용
                .requestMatchers("/api/find-username", "/api/request-password-reset", "/api/reset-password").permitAll() // 아이디 찾기, 비밀번호 재설정 허용
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll() // Swagger UI 허용
                .requestMatchers("/api/expenses/**").authenticated() // 지출결의서 API는 인증 필요
                .requestMatchers("/api/users/admins").authenticated() // ADMIN 목록도 인증 필요
                .anyRequest().authenticated() // 그 외 모든 요청은 인증 필요
            )
            .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class) // Rate Limit 필터 추가 (먼저)
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class); // JWT 필터 추가 (그 다음)

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // 프로파일에 따라 다른 CORS 설정 적용
        String[] activeProfiles = environment.getActiveProfiles();
        boolean isProd = Arrays.asList(activeProfiles).contains("prod");
        
        if (isProd) {
            // 프로덕션 환경: 환경변수에서 허용된 도메인 읽기
            String allowedOrigins = System.getenv("CORS_ALLOWED_ORIGINS");
            if (allowedOrigins != null && !allowedOrigins.isEmpty()) {
                configuration.setAllowedOriginPatterns(Arrays.asList(allowedOrigins.split(",")));
            } else {
                // 환경변수가 없으면 기본값 (실제 운영 시 반드시 설정 필요)
                configuration.setAllowedOriginPatterns(List.of("https://yourdomain.com"));
            }
        } else {
            // 개발 환경: localhost만 허용
            configuration.setAllowedOriginPatterns(List.of(
                "http://localhost:5173",  // Vite 개발 서버
                "http://localhost:3000"   // React 개발 서버 (선택사항)
            ));
        }
        
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setExposedHeaders(Arrays.asList("Authorization")); // JWT 토큰 헤더 노출
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
