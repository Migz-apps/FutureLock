package com.futurelock.vault.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {
    private final JwtService jwtService = new JwtService(
            "test-only-secret-that-is-at-least-thirty-two-bytes-long", 15, 7);

    @Test
    void accessToken_shouldContainSubjectAndRoleAndNotBeRefreshToken() {
        String token = jwtService.generateAccessToken("buyer@example.com", "Buyer");

        assertEquals("buyer@example.com", jwtService.extractSubject(token));
        assertEquals("Buyer", jwtService.extractRole(token));
        assertTrue(jwtService.isAccessToken(token));
        assertFalse(jwtService.isRefreshToken(token));
    }

    @Test
    void refreshToken_shouldBeDistinguishableFromAccessToken() {
        String token = jwtService.generateRefreshToken("creator@example.com", "Creator");

        assertEquals("creator@example.com", jwtService.extractSubject(token));
        assertTrue(jwtService.isRefreshToken(token));
        assertFalse(jwtService.isAccessToken(token));
    }

    @Test
    void malformedToken_shouldBeRejected() {
        assertThrows(Exception.class, () -> jwtService.extractSubject("not-a-jwt"));
        assertFalse(jwtService.isAccessToken("not-a-jwt"));
        assertFalse(jwtService.isRefreshToken("not-a-jwt"));
    }

    @Test
    void shortSecret_shouldBeRejectedAtConfigurationTime() {
        assertThrows(IllegalArgumentException.class, () -> new JwtService("too-short", 15, 7));
    }
}
