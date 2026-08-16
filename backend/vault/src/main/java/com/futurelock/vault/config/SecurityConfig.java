package com.futurelock.vault.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public CorsWebFilter corsWebFilter(
            @Value("${app.cors.allowed-origins:http://localhost:3000}") String allowedOrigins) {

        CorsConfiguration config = new CorsConfiguration();

        List<String> origins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isBlank())
                .toList();

        config.setAllowedOrigins(origins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "X-Requested-With"));
        config.setExposedHeaders(List.of("Set-Cookie"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsWebFilter(source);
    }

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        return http
                .cors(ServerHttpSecurity.CorsSpec::disable)
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .authorizeExchange(exchanges -> exchanges
                        .pathMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Authentication flow. These endpoints perform their own credential/code checks.
                        .pathMatchers(
                                "/auth/login",
                                "/auth/signup",
                                "/auth/wallet-login",
                                "/auth/request-verification",
                                "/auth/confirm-code",
                                "/auth/refresh",
                                "/auth/logout"
                        ).permitAll()

                        // Keep these public for local health checks.
                        .pathMatchers("/actuator/health", "/actuator/metrics").permitAll()

                        /*
                         * Until a WebFlux JWT authentication filter/decoder is wired to FutureLock's
                         * JJWT tokens, requiring authenticated() here would make protected endpoints
                         * permanently return 401. For local integration testing we therefore allow
                         * the remaining endpoints.
                         *
                         * Before production, replace this with JWT-backed authorization.
                         */
                        .anyExchange().permitAll()
                )
                .build();
    }
}
