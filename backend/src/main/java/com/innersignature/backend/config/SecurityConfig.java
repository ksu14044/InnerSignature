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

    /**
     * SecurityFilterChain 설정
     * Swagger 경로는 필터에서 제외되므로 permitAll()만으로 충분
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                .accessDeniedHandler(customAccessDeniedHandler)
            )
            .headers(headers -> headers
                .addHeaderWriter(new StaticHeadersWriter("X-Content-Type-Options", "nosniff"))
                .frameOptions(frame -> frame.deny())
                .addHeaderWriter(new StaticHeadersWriter("X-XSS-Protection", "1; mode=block"))
                .referrerPolicy(referrer -> referrer.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.NO_REFERRER))
                .httpStrictTransportSecurity(hsts -> hsts.disable())
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authorizeHttpRequests(authz -> authz
                // Swagger - 최소 필수 경로만 허용 (순서 중요)
                .requestMatchers(
                    "/swagger-ui.html",
                    "/swagger-ui/**",
                    "/v3/api-docs",
                    "/v3/api-docs/**",
                    "/webjars/**",
                    "/swagger-resources/**"
                ).permitAll()
                // 공개 API
                .requestMatchers("/api/register", "/api/login").permitAll()
                .requestMatchers("/api/refresh-token", "/api/logout").permitAll()
                .requestMatchers("/api/find-username", "/api/request-password-reset", "/api/reset-password").permitAll()
                .requestMatchers("/api/companies/search").permitAll()  // 회사 검색 공개 API
                .requestMatchers("/api/users/check-username", "/api/users/check-email").permitAll()  // username, email 중복체크 공개 API
                // 인증 필요 API
                .requestMatchers("/api/expenses/**").authenticated()
                .requestMatchers("/api/users/admins").authenticated()
                .anyRequest().authenticated()
            )
            .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

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
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Disposition")); // JWT 토큰 헤더 및 파일 다운로드 헤더 노출
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
