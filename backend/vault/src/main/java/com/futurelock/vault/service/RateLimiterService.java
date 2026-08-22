package com.futurelock.vault.service;

import com.futurelock.vault.model.EmailVerification;
import com.futurelock.vault.repository.EmailVerificationRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Locale;

@Service
public class RateLimiterService {
    private static final Duration CODE_LIFETIME = Duration.ofMinutes(5);
    private static final Duration REQUEST_WINDOW = Duration.ofHours(1);
    private static final int MAX_REQUESTS_PER_WINDOW = 6;
    private final EmailVerificationRepository repository;

    public RateLimiterService(EmailVerificationRepository repository) {
        this.repository = repository;
    }

    public Mono<Void> checkLimitAndStore(String rawEmail, String code) {
        String email = normalizeEmail(rawEmail);
        if (email.isBlank() || code == null || code.isBlank()) {
            return Mono.error(new IllegalArgumentException("Email and verification code are required."));
        }
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        return repository.findById(email).defaultIfEmpty(new EmailVerification(
                        email, "", now, 0, now, false, now, null))
                .flatMap(existing -> {
                    boolean resetWindow = existing.windowStartedAt().plus(REQUEST_WINDOW).isBefore(now);
                    int count = resetWindow ? 0 : existing.requestCount();
                    if (count >= MAX_REQUESTS_PER_WINDOW) {
                        return Mono.error(new IllegalStateException("Too many verification requests. Please try again later."));
                    }
                    return repository.save(new EmailVerification(email, hash(code), now.plus(CODE_LIFETIME),
                            count + 1, resetWindow ? now : existing.windowStartedAt(), false, now, existing.version()));
                }).then();
    }

    public Mono<Boolean> validateCode(String rawEmail, String rawCode) {
        String email = normalizeEmail(rawEmail);
        String code = rawCode == null ? "" : rawCode.trim();
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        return repository.findById(email)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Code expired or not found. Please request a new one.")))
                .flatMap(data -> {
                    if (data.expiresAt().isBefore(now)) {
                        return repository.deleteById(email).then(Mono.error(new IllegalArgumentException("Verification code has expired. Please request a new code.")));
                    }
                    if (!MessageDigest.isEqual(data.codeHash().getBytes(StandardCharsets.UTF_8), hash(code).getBytes(StandardCharsets.UTF_8))) {
                        return Mono.just(false);
                    }
                    return repository.save(new EmailVerification(data.email(), data.codeHash(), data.expiresAt(),
                            data.requestCount(), data.windowStartedAt(), true, data.createdAt(), data.version())).thenReturn(true);
                });
    }

    public Mono<Void> requireVerifiedEmail(String rawEmail) {
        String email = normalizeEmail(rawEmail);
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);
        return repository.findById(email)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Email verification is required.")))
                .flatMap(data -> {
                    if (data.expiresAt().isBefore(now)) {
                        return repository.deleteById(email).then(Mono.error(new IllegalArgumentException("Email verification has expired. Please request a new code.")));
                    }
                    return data.verified() ? Mono.empty() : Mono.error(new IllegalArgumentException("Please verify your email before creating the account."));
                });
    }

    public Mono<Void> consumeVerifiedEmail(String rawEmail) {
        return repository.deleteById(normalizeEmail(rawEmail));
    }

    private String hash(String value) {
        try {
            return java.util.HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception ex) {
            throw new IllegalStateException("Unable to secure verification code.", ex);
        }
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }
}
