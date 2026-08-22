package com.futurelock.vault.security;

import com.futurelock.vault.config.SecurityConfig;
import com.futurelock.vault.service.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.webflux.test.autoconfigure.WebFluxTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.reactive.server.WebTestClient;

@WebFluxTest(controllers = SecurityEndpointTest.ProbeController.class)
@ContextConfiguration(classes = {
        SecurityEndpointTest.ProbeController.class,
        SecurityConfig.class,
        SecurityEndpointTest.TestJwtConfiguration.class
})
class SecurityEndpointTest {
    @Autowired WebTestClient client;
    @Autowired JwtService jwtService;
    @Autowired CorsConfigurationSource corsConfigurationSource;

    @DynamicPropertySource
    static void corsProperties(DynamicPropertyRegistry registry) {
        registry.add("app.cors.allowed-origins", () -> "https://frontend.test.futurelock.example");
    }

    @Test
    void anonymousUser_shouldOnlyReachPublicIntelEndpoint() {
        client.get().uri("/api/v1/intel/public").exchange().expectStatus().isOk();
        client.get().uri("/api/buyer/probe").exchange().expectStatus().isUnauthorized();
        client.get().uri("/api/creator/probe").exchange().expectStatus().isUnauthorized();
    }

    @Test
    void roleBoundaries_shouldRejectWrongRole() {
        String buyer = jwtService.generateAccessToken("buyer@example.com", "Buyer");
        String creator = jwtService.generateAccessToken("creator@example.com", "Creator");

        client.get().uri("/api/buyer/probe").header(HttpHeaders.AUTHORIZATION, "Bearer " + buyer)
                .exchange().expectStatus().isOk();
        client.get().uri("/api/creator/probe").header(HttpHeaders.AUTHORIZATION, "Bearer " + buyer)
                .exchange().expectStatus().isForbidden();
        client.get().uri("/api/creator/probe").header(HttpHeaders.AUTHORIZATION, "Bearer " + creator)
                .exchange().expectStatus().isOk();
    }

    @Test
    void corsConfiguration_shouldAllowConfiguredOriginWithCredentialsButRejectArbitraryOrigin() {
        MockServerWebExchange exchange = MockServerWebExchange.from(
                MockServerHttpRequest.options("/api/buyer/probe")
                        .header(HttpHeaders.ORIGIN, "https://frontend.test.futurelock.example")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET"));
        CorsConfiguration configuration = corsConfigurationSource.getCorsConfiguration(exchange);

        org.junit.jupiter.api.Assertions.assertNotNull(configuration);
        org.junit.jupiter.api.Assertions.assertEquals("https://frontend.test.futurelock.example",
                configuration.checkOrigin("https://frontend.test.futurelock.example"));
        org.junit.jupiter.api.Assertions.assertNull(configuration.checkOrigin("https://untrusted.example"));
        org.junit.jupiter.api.Assertions.assertTrue(configuration.getAllowCredentials());
        org.junit.jupiter.api.Assertions.assertTrue(configuration.getAllowedMethods().contains(HttpMethod.OPTIONS.name()));
    }

    @RestController
    static class ProbeController {
        @GetMapping("/api/v1/intel/public") String publicIntel() { return "public"; }
        @GetMapping("/api/buyer/probe") String buyer() { return "buyer"; }
        @GetMapping("/api/creator/probe") String creator() { return "creator"; }
    }

    @TestConfiguration
    static class TestJwtConfiguration {
        @Bean JwtService jwtService() {
            return new JwtService("test-only-secret-that-is-at-least-thirty-two-bytes-long", 15, 7);
        }
    }
}
