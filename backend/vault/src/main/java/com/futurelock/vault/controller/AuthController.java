package com.futurelock.vault.controller;

import com.futurelock.vault.model.User;
import com.futurelock.vault.repository.UserRepository;
import com.futurelock.vault.service.AuthService;
import com.futurelock.vault.service.EmailService;
import com.futurelock.vault.service.EmailVerificationService;
import com.futurelock.vault.service.JwtService;
import com.futurelock.vault.service.RateLimiterService;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final EmailVerificationService emailVerificationService;
    private final RateLimiterService rateLimiterService;
    private final EmailService emailService;

    @Value("${app.security.secure-cookies:false}")
    private boolean secureCookies;

    public AuthController(
            AuthService authService,
            UserRepository userRepository,
            JwtService jwtService,
            EmailVerificationService emailVerificationService,
            RateLimiterService rateLimiterService,
            EmailService emailService
    ) {
        this.authService = authService;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.emailVerificationService = emailVerificationService;
        this.rateLimiterService = rateLimiterService;
        this.emailService = emailService;
    }

    // =========================================================
    // EMAIL VERIFICATION
    // =========================================================

    @PostMapping("/request-verification")
    public Mono<ResponseEntity<Map<String, String>>> requestVerification(
            @RequestBody EmailRequest request
    ) {
        String email = normalizeEmail(request.email());

        if (email.isBlank()) {
            return Mono.error(
                    new IllegalArgumentException("Email is required.")
            );
        }

        return userRepository.findByEmail(email)
                .flatMap(existing ->
                        Mono.<ResponseEntity<Map<String, String>>>error(
                                new IllegalStateException(
                                        "Email already registered."
                                )
                        )
                )
                .switchIfEmpty(
                        emailVerificationService
                                .verifyAndGenerateCode(email)
                                .flatMap(code ->
                                        rateLimiterService
                                                .checkLimitAndStore(email, code)
                                                .then(
                                                        emailService
                                                                .sendVerificationEmail(
                                                                        email,
                                                                        code
                                                                )
                                                )
                                )
                                .thenReturn(
                                        ResponseEntity.ok(
                                                Map.of(
                                                        "message",
                                                        "Verification code sent."
                                                )
                                        )
                                )
                );
    }

    @PostMapping("/confirm-code")
    public Mono<ResponseEntity<Map<String, Object>>> confirmCode(
            @RequestBody VerifyCodeRequest request
    ) {
        String email = normalizeEmail(request.email());

        String code =
                request.code() == null
                        ? ""
                        : request.code().trim();

        if (email.isBlank()) {
            return Mono.error(
                    new IllegalArgumentException("Email is required.")
            );
        }

        if (code.isBlank()) {
            return Mono.error(
                    new IllegalArgumentException(
                            "Verification code is required."
                    )
            );
        }

        return rateLimiterService
                .validateCode(email, code)
                .flatMap(valid -> {

                    if (!valid) {
                        return Mono.error(
                                new IllegalArgumentException(
                                        "Invalid verification code."
                                )
                        );
                    }

                    return Mono.just(
                            ResponseEntity.ok(
                                    Map.<String, Object>of(
                                            "verified", true,
                                            "message", "Email verified."
                                    )
                            )
                    );
                });
    }

    // =========================================================
    // SIGNUP
    // =========================================================

    @PostMapping("/signup")
    public Mono<ResponseEntity<Map<String, String>>> signup(
            @RequestBody SignupData data
    ) {
        String email = normalizeEmail(data.email());

        return rateLimiterService
                .consumeVerifiedEmail(email)
                .then(
                        authService.signup(
                                data.username(),
                                email,
                                data.password(),
                                data.role()
                        )
                )
                .map(user ->
                        authenticatedResponse(
                                user,
                                "Signup successful"
                        )
                );
    }

    // =========================================================
    // EMAIL LOGIN
    // =========================================================

    @PostMapping("/login")
    public Mono<ResponseEntity<Map<String, String>>> login(
            @RequestBody LoginData data
    ) {
        return authService
                .authenticateEmail(
                        data.email(),
                        data.password()
                )
                .map(user ->
                        authenticatedResponse(
                                user,
                                "Login successful"
                        )
                );
    }

    // =========================================================
    // WALLET LOGIN
    // =========================================================

    @PostMapping("/wallet-login")
    public Mono<ResponseEntity<Map<String, String>>> walletLogin(
            @RequestBody WalletLoginData data
    ) {
        return authService
                .walletLogin(
                        data.walletAddress(),
                        data.username(),
                        data.role()
                )
                .map(user ->
                        authenticatedResponse(
                                user,
                                "Wallet login successful"
                        )
                );
    }

    // =========================================================
    // CURRENT USER
    // =========================================================

    @GetMapping("/me")
    public Mono<ResponseEntity<Map<String, Object>>> me(
            @CookieValue(
                    value = "access_token",
                    defaultValue = ""
            )
            String accessToken
    ) {
        if (accessToken.isBlank()) {
            return Mono.error(
                    new IllegalArgumentException(
                            "Not authenticated."
                    )
            );
        }

        String subject;

        try {
            subject = jwtService.extractSubject(accessToken);
        } catch (Exception ex) {
            return Mono.error(
                    new IllegalArgumentException(
                            "Session expired or invalid."
                    )
            );
        }

        return findUserByIdentity(subject)
                .map(user ->
                        ResponseEntity.ok(
                                Map.<String, Object>of(
                                        "id",
                                        user.id(),

                                        "username",
                                        user.username(),

                                        "role",
                                        user.role(),

                                        "identityType",
                                        identityType(user),

                                        "identity",
                                        identity(user),

                                        "trust_score",
                                        user.trustScore(),

                                        "ratings_count",
                                        user.ratingsCount()
                                )
                        )
                )
                .switchIfEmpty(
                        Mono.error(
                                new IllegalArgumentException(
                                        "User not found."
                                )
                        )
                );
    }

    // =========================================================
    // TOKEN REFRESH
    // =========================================================

    @PostMapping("/refresh")
    public Mono<ResponseEntity<Map<String, String>>> refresh(
            @CookieValue(
                    value = "refresh_token",
                    defaultValue = ""
            )
            String refreshToken
    ) {
        if (refreshToken.isBlank()) {
            return Mono.error(
                    new IllegalArgumentException(
                            "Refresh token is missing."
                    )
            );
        }

        try {
            if (!jwtService.isRefreshToken(refreshToken)) {
                return Mono.error(
                        new IllegalArgumentException(
                                "Invalid refresh token."
                        )
                );
            }
        } catch (Exception ex) {
            return Mono.error(
                    new IllegalArgumentException(
                            "Invalid or expired refresh token."
                    )
            );
        }

        String subject;

        try {
            subject = jwtService.extractSubject(refreshToken);
        } catch (Exception ex) {
            return Mono.error(
                    new IllegalArgumentException(
                            "Invalid or expired refresh token."
                    )
            );
        }

        return findUserByIdentity(subject)
                .map(user -> {

                    String access =
                            jwtService.generateAccessToken(
                                    identity(user)
                            );

                    HttpHeaders headers =
                            new HttpHeaders();

                    headers.add(
                            HttpHeaders.SET_COOKIE,
                            accessCookie(access).toString()
                    );

                    return ResponseEntity.ok()
                            .headers(headers)
                            .body(
                                    Map.of(
                                            "message",
                                            "Token refreshed"
                                    )
                            );
                })
                .switchIfEmpty(
                        Mono.error(
                                new IllegalArgumentException(
                                        "User not found."
                                )
                        )
                );
    }

    // =========================================================
    // LOGOUT
    // =========================================================

    @PostMapping("/logout")
    public Mono<ResponseEntity<Map<String, String>>> logout() {

        HttpHeaders headers =
                new HttpHeaders();

        headers.add(
                HttpHeaders.SET_COOKIE,
                deleteCookie("access_token").toString()
        );

        headers.add(
                HttpHeaders.SET_COOKIE,
                deleteCookie("refresh_token").toString()
        );

        return Mono.just(
                ResponseEntity.ok()
                        .headers(headers)
                        .body(
                                Map.of(
                                        "message",
                                        "Logged out successfully"
                                )
                        )
        );
    }

    // =========================================================
    // AUTH RESPONSE
    // =========================================================

    private ResponseEntity<Map<String, String>>
    authenticatedResponse(
            User user,
            String message
    ) {

        String identifier =
                identity(user);

        String access =
                jwtService.generateAccessToken(
                        identifier
                );

        String refresh =
                jwtService.generateRefreshToken(
                        identifier
                );

        HttpHeaders headers =
                new HttpHeaders();

        headers.add(
                HttpHeaders.SET_COOKIE,
                accessCookie(access).toString()
        );

        headers.add(
                HttpHeaders.SET_COOKIE,
                refreshCookie(refresh).toString()
        );

        return ResponseEntity.ok()
                .headers(headers)
                .body(
                        Map.of(
                                "message",
                                message,

                                "role",
                                user.role(),

                                "username",
                                user.username(),

                                "identityType",
                                identityType(user),

                                "identity",
                                identifier
                        )
                );
    }

    // =========================================================
    // COOKIES
    // =========================================================

    private ResponseCookie accessCookie(
            String token
    ) {
        return ResponseCookie
                .from(
                        "access_token",
                        token
                )
                .httpOnly(true)
                .secure(secureCookies)
                .sameSite(
                        secureCookies
                                ? "None"
                                : "Lax"
                )
                .path("/")
                .maxAge(
                        Duration.ofMinutes(15)
                )
                .build();
    }

    private ResponseCookie refreshCookie(
            String token
    ) {
        return ResponseCookie
                .from(
                        "refresh_token",
                        token
                )
                .httpOnly(true)
                .secure(secureCookies)
                .sameSite(
                        secureCookies
                                ? "None"
                                : "Lax"
                )
                .path("/")
                .maxAge(
                        Duration.ofDays(7)
                )
                .build();
    }

    private ResponseCookie deleteCookie(
            String name
    ) {
        return ResponseCookie
                .from(name, "")
                .httpOnly(true)
                .secure(secureCookies)
                .sameSite(
                        secureCookies
                                ? "None"
                                : "Lax"
                )
                .path("/")
                .maxAge(Duration.ZERO)
                .build();
    }

    // =========================================================
    // HELPERS
    // =========================================================

    private Mono<User> findUserByIdentity(
            String identity
    ) {
        return userRepository
                .findByEmail(identity)
                .switchIfEmpty(
                        userRepository
                                .findByWalletAddress(
                                        identity
                                )
                );
    }

    private String identity(
            User user
    ) {
        return user.email() != null
                ? user.email()
                : user.walletAddress();
    }

    private String identityType(
            User user
    ) {
        return user.email() != null
                ? "email"
                : "wallet";
    }

    private String normalizeEmail(
            String email
    ) {
        return email == null
                ? ""
                : email.trim().toLowerCase();
    }

    // =========================================================
    // REQUEST RECORDS
    // =========================================================

    public record EmailRequest(
            String email
    ) {
    }

    public record VerifyCodeRequest(
            String email,
            String code
    ) {
    }

    public record SignupData(
            String username,
            String email,
            String password,
            String role
    ) {
    }

    public record LoginData(
            String email,
            String password,
            String role
    ) {
    }

    public record WalletLoginData(
            String username,
            String walletAddress,
            String role
    ) {
    }
}