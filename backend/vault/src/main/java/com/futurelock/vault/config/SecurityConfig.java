package com.futurelock.vault.config;

import com.futurelock.vault.service.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource(
            @Value("${app.cors.allowed-origins:http://localhost:3000}") String allowedOrigins) {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.stream(allowedOrigins.split(","))
                .map(String::trim).filter(origin -> !origin.isBlank()).toList());
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "X-Requested-With"));
        config.setExposedHeaders(List.of("Set-Cookie"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(
            ServerHttpSecurity http,
            JwtService jwtService,
            CorsConfigurationSource corsConfigurationSource) {
        return http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .addFilterAt((exchange, chain) -> {
                    String authorization = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
                    String token = authorization != null && authorization.startsWith("Bearer ")
                            ? authorization.substring(7)
                            : exchange.getRequest().getCookies().getFirst("access_token") == null
                                    ? ""
                                    : exchange.getRequest().getCookies().getFirst("access_token").getValue();
                    if (token.isBlank() || !jwtService.isAccessToken(token)) {
                        return chain.filter(exchange);
                    }
                    try {
                        String subject = jwtService.extractSubject(token);
                        String role = jwtService.extractRole(token);
                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(subject, null,
                                        List.of(new SimpleGrantedAuthority("ROLE_" + role)));
                        return chain.filter(exchange).contextWrite(
                                ReactiveSecurityContextHolder.withAuthentication(authentication));
                    } catch (Exception ignored) {
                        return chain.filter(exchange);
                    }
                }, SecurityWebFiltersOrder.AUTHENTICATION)
                .authorizeExchange(exchanges -> exchanges
                        .pathMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .pathMatchers("/auth/login", "/auth/signup", "/auth/wallet-login",
                                "/auth/request-verification", "/auth/confirm-code", "/auth/refresh", "/auth/logout",
                                "/actuator/health", "/api/system/healthcheck", "/api/v1/intel/public").permitAll()
                        .pathMatchers("/api/creator/**", "/api/v1/intel/create").hasRole("Creator")
                        .pathMatchers("/api/buyer/**", "/api/purchase").hasRole("Buyer")
                        .anyExchange().authenticated())
                .build();
    }
}
