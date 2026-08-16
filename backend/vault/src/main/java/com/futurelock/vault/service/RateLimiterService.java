package com.futurelock.vault.service;

import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimiterService {

    private static final int MAX_REQUESTS_PER_HOUR = 6;
    private static final long CODE_TTL_SECONDS = 120;
    private static final long VERIFIED_TTL_SECONDS = 600;

    private final Map<String, VerificationData> storage = new ConcurrentHashMap<>();
    private final Map<String, Instant> verifiedEmails = new ConcurrentHashMap<>();

    private record VerificationData(
            String code,
            Instant expiry,
            int requestsInWindow,
            Instant windowStart) {
    }

    public Mono<Void> checkLimitAndStore(String rawEmail, String code) {
        String email = normalize(rawEmail);
        Instant now = Instant.now();

        VerificationData current = storage.get(email);

        if (current == null || current.windowStart().plusSeconds(3600).isBefore(now)) {
            current = new VerificationData(null, null, 0, now);
        }

        if (current.requestsInWindow() >= MAX_REQUESTS_PER_HOUR) {
            return Mono.error(new IllegalStateException(
                    "Too many verification requests. Please try again later."));
        }

        storage.put(email, new VerificationData(
                code,
                now.plusSeconds(CODE_TTL_SECONDS),
                current.requestsInWindow() + 1,
                current.windowStart()));

        return Mono.empty();
    }

    public Mono<Boolean> validateCode(String rawEmail, String userInput) {
        String email = normalize(rawEmail);
        VerificationData data = storage.get(email);

        if (data == null || data.code() == null || data.expiry() == null
                || data.expiry().isBefore(Instant.now())) {
            return Mono.error(new IllegalArgumentException(
                    "Code expired or not found. Please request a new one."));
        }

        if (!data.code().equals(userInput)) {
            return Mono.just(false);
        }

        verifiedEmails.put(email, Instant.now().plusSeconds(VERIFIED_TTL_SECONDS));
        storage.remove(email);
        return Mono.just(true);
    }

    public Mono<Void> consumeVerifiedEmail(String rawEmail) {
        String email = normalize(rawEmail);
        Instant expiry = verifiedEmails.remove(email);

        if (expiry == null || expiry.isBefore(Instant.now())) {
            return Mono.error(new IllegalStateException(
                    "Email has not been verified or the verification has expired."));
        }

        return Mono.empty();
    }

    private String normalize(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }
}
