package com.futurelock.vault.service;

import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimiterService {
    
    // In production, replace this with Redis for 5M+ request scaling
    private final Map<String, VerificationData> storage = new ConcurrentHashMap<>();

    private record VerificationData(String code, Instant expiry, int attempts, Instant windowStart) {}

    public Mono<Void> checkLimitAndStore(String email, String code) {
        Instant now = Instant.now();
        VerificationData data = storage.getOrDefault(email, new VerificationData(null, null, 0, now));

        // Reset hour window if expired
        if (data.windowStart().plusSeconds(3600).isBefore(now)) {
            data = new VerificationData(null, null, 0, now);
        }

        if (data.attempts() >= 6) {
            return Mono.error(new RuntimeException("Too many attempts. Please try again in an hour."));
        }

        storage.put(email, new VerificationData(
            code, 
            now.plusSeconds(120), // 2-minute expiration
            data.attempts() + 1, 
            data.windowStart()
        ));
        
        return Mono.empty();
    }

    public Mono<Boolean> validateCode(String email, String userInput) {
        VerificationData data = storage.get(email);
        if (data == null || data.code() == null || data.expiry().isBefore(Instant.now())) {
            return Mono.error(new RuntimeException("Code expired or not found. Please request a new one."));
        }
        return Mono.just(data.code().equals(userInput));
    }
}