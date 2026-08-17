package com.futurelock.vault.service;

import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimiterService {

    private static final Duration CODE_LIFETIME = Duration.ofMinutes(5);
    private static final Duration REQUEST_WINDOW = Duration.ofHours(1);
    private static final int MAX_REQUESTS_PER_WINDOW = 6;

    private final Map<String, VerificationData> verificationStorage =
            new ConcurrentHashMap<>();

    private record VerificationData(
            String code,
            Instant expiresAt,
            int requestCount,
            Instant windowStartedAt,
            boolean verified
    ) {
    }

    /**
     * Stores a newly generated verification code.
     *
     * Calling this again for the same email replaces the previous code
     * and resets the verified flag.
     */
    public Mono<Void> checkLimitAndStore(
            String rawEmail,
            String code
    ) {
        return Mono.fromRunnable(() -> {

            String email = normalizeEmail(rawEmail);

            if (email.isBlank()) {
                throw new IllegalArgumentException(
                        "Email is required."
                );
            }

            if (code == null || code.isBlank()) {
                throw new IllegalArgumentException(
                        "Verification code is required."
                );
            }

            Instant now = Instant.now();

            verificationStorage.compute(email, (key, existing) -> {

                int requestCount = 0;
                Instant windowStartedAt = now;

                if (existing != null) {

                    boolean windowExpired =
                            existing.windowStartedAt()
                                    .plus(REQUEST_WINDOW)
                                    .isBefore(now);

                    if (!windowExpired) {
                        requestCount =
                                existing.requestCount();

                        windowStartedAt =
                                existing.windowStartedAt();
                    }
                }

                if (requestCount >= MAX_REQUESTS_PER_WINDOW) {
                    throw new IllegalStateException(
                            "Too many verification requests. Please try again later."
                    );
                }

                return new VerificationData(
                        code,
                        now.plus(CODE_LIFETIME),
                        requestCount + 1,
                        windowStartedAt,
                        false
                );
            });
        });
    }

    /**
     * Checks the code without removing the verification record.
     *
     * If the code is correct, the same record is updated with
     * verified=true so the subsequent /auth/signup request can consume it.
     */
    public Mono<Boolean> validateCode(
            String rawEmail,
            String rawCode
    ) {
        return Mono.defer(() -> {

            String email =
                    normalizeEmail(rawEmail);

            String code =
                    rawCode == null
                            ? ""
                            : rawCode.trim();

            VerificationData data =
                    verificationStorage.get(email);

            if (data == null) {
                return Mono.error(
                        new IllegalArgumentException(
                                "Code expired or not found. Please request a new one."
                        )
                );
            }

            Instant now = Instant.now();

            if (data.expiresAt().isBefore(now)) {

                verificationStorage.remove(email);

                return Mono.error(
                        new IllegalArgumentException(
                                "Verification code has expired. Please request a new one."
                        )
                );
            }

            if (!data.code().equals(code)) {
                return Mono.just(false);
            }

            verificationStorage.put(
                    email,
                    new VerificationData(
                            data.code(),
                            data.expiresAt(),
                            data.requestCount(),
                            data.windowStartedAt(),
                            true
                    )
            );

            return Mono.just(true);
        });
    }

    /**
     * Called immediately before account creation.
     *
     * Signup is allowed only after /auth/confirm-code has marked
     * the email as verified.
     *
     * The record is removed only after successful consumption.
     */
    public Mono<Void> consumeVerifiedEmail(
            String rawEmail
    ) {
        return Mono.defer(() -> {

            String email =
                    normalizeEmail(rawEmail);

            VerificationData data =
                    verificationStorage.get(email);

            if (data == null) {
                return Mono.error(
                        new IllegalArgumentException(
                                "Email verification is required."
                        )
                );
            }

            if (data.expiresAt().isBefore(Instant.now())) {

                verificationStorage.remove(email);

                return Mono.error(
                        new IllegalArgumentException(
                                "Email verification has expired. Please request a new code."
                        )
                );
            }

            if (!data.verified()) {
                return Mono.error(
                        new IllegalArgumentException(
                                "Please verify your email before creating the account."
                        )
                );
            }

            verificationStorage.remove(email);

            return Mono.empty();
        });
    }

    private String normalizeEmail(
            String email
    ) {
        return email == null
                ? ""
                : email.trim()
                .toLowerCase(Locale.ROOT);
    }
}