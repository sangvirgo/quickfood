package com.quickfood.api_gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        http
            // 1. Kích hoạt CORS (Nó sẽ tự động liên kết với file CorsConfig.java của bạn)
            .cors(Customizer.withDefaults())
            
            // 2. Tắt CSRF
            .csrf(ServerHttpSecurity.CsrfSpec::disable)
            
            // 3. Phân quyền
            .authorizeExchange(exchanges -> exchanges
                // RẤT QUAN TRỌNG: Cho phép các request mồi (Preflight) đi qua
                .pathMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                
                // Các endpoint không cần đăng nhập
                .pathMatchers("/eureka/**").permitAll()
                .pathMatchers("/api/core/auth/**").permitAll()
                
                // Các request khác: Ở đây tôi khuyên dùng .authenticated() thay vì .permitAll() 
                // để Gateway thực sự bảo vệ các API của bạn bằng JWT.
                .anyExchange().authenticated() 
            );
            
        return http.build();
    }
}