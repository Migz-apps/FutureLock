package com.futurelock.vault.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey key;
    private final long accessTokenMillis;
    private final long refreshTokenMillis;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.access-token-minutes:15}") long accessTokenMinutes,
            @Value("${app.jwt.refresh-token-days:7}") long refreshTokenDays) {

        if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalArgumentException("JWT secret must be at least 32 bytes long.");
        }

        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenMillis = Duration.ofMinutes(accessTokenMinutes).toMillis();
        this.refreshTokenMillis = Duration.ofDays(refreshTokenDays).toMillis();
    }

    public String generateAccessToken(String subject) {
        long now = System.currentTimeMillis();

        return Jwts.builder()
                .subject(subject)
                .issuedAt(new Date(now))
                .expiration(new Date(now + accessTokenMillis))
                .signWith(key)
                .compact();
    }

    public String generateRefreshToken(String subject) {
        long now = System.currentTimeMillis();

        return Jwts.builder()
                .subject(subject)
                .claim("refresh", true)
                .issuedAt(new Date(now))
                .expiration(new Date(now + refreshTokenMillis))
                .signWith(key)
                .compact();
    }

    public String extractSubject(String token) {
        return parseClaims(token).getSubject();
    }

    public boolean isRefreshToken(String token) {
        try {
            Boolean refresh = parseClaims(token).get("refresh", Boolean.class);
            return Boolean.TRUE.equals(refresh);
        } catch (Exception ex) {
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
