package com.futurelock.vault.controller;

import com.futurelock.vault.exception.GlobalExceptionHandler;
import com.futurelock.vault.model.User;
import com.futurelock.vault.repository.UserRepository;
import com.futurelock.vault.service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.reactive.server.WebTestClient;
import org.springframework.http.MediaType;
import reactor.core.publisher.Mono;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class AuthControllerTest {
    private AuthService authService;
    private UserRepository users;
    private EmailVerificationService emailVerificationService;
    private RateLimiterService verificationStore;
    private EmailService emailService;
    private JwtService jwtService;
    private WebTestClient client;

    @BeforeEach
    void setUp() {
        authService = mock(AuthService.class);
        users = mock(UserRepository.class);
        emailVerificationService = mock(EmailVerificationService.class);
        verificationStore = mock(RateLimiterService.class);
        emailService = mock(EmailService.class);
        jwtService = new JwtService("test-only-secret-that-is-at-least-thirty-two-bytes-long", 15, 7);
        when(users.findByWalletAddress(anyString())).thenReturn(Mono.empty());
        client = WebTestClient.bindToController(new AuthController(authService, users, jwtService,
                        emailVerificationService, verificationStore, emailService))
                .controllerAdvice(new GlobalExceptionHandler()).build();
    }

    @Test
    void requestVerification_shouldNormalizeEmailSendMailAndNeverReturnCode() {
        when(users.findByEmail("alice@example.com")).thenReturn(Mono.empty());
        when(emailVerificationService.verifyAndGenerateCode("alice@example.com")).thenReturn(Mono.just("123456"));
        when(verificationStore.checkLimitAndStore("alice@example.com", "123456")).thenReturn(Mono.empty());
        when(emailService.sendVerificationEmail("alice@example.com", "123456")).thenReturn(Mono.empty());

        client.post().uri("/auth/request-verification").contentType(MediaType.APPLICATION_JSON).bodyValue("{\"email\":\" Alice@Example.COM \"}")
                .exchange().expectStatus().isOk().expectBody()
                .jsonPath("$.message").isEqualTo("Verification code sent.")
                .jsonPath("$.code").doesNotExist();

        verify(emailService).sendVerificationEmail("alice@example.com", "123456");
    }

    @Test
    void requestVerification_shouldRejectMissingEmail() {
        client.post().uri("/auth/request-verification").contentType(MediaType.APPLICATION_JSON).bodyValue("{\"email\":\" \"}")
                .exchange().expectStatus().isBadRequest()
                .expectBody().jsonPath("$.message").isEqualTo("Email is required.");
    }

    @Test
    void confirmCode_shouldReportInvalidAndAcceptValidCode() {
        when(verificationStore.validateCode("alice@example.com", "111111")).thenReturn(Mono.just(false));
        client.post().uri("/auth/confirm-code").contentType(MediaType.APPLICATION_JSON).bodyValue("{\"email\":\"alice@example.com\",\"code\":\"111111\"}")
                .exchange().expectStatus().isBadRequest();

        when(verificationStore.validateCode("alice@example.com", "123456")).thenReturn(Mono.just(true));
        client.post().uri("/auth/confirm-code").contentType(MediaType.APPLICATION_JSON).bodyValue("{\"email\":\"ALICE@example.com\",\"code\":\" 123456 \"}")
                .exchange().expectStatus().isOk().expectBody().jsonPath("$.verified").isEqualTo(true);
    }

    @Test
    void signup_shouldNotConsumeVerificationWhenPersistenceFails() {
        when(verificationStore.requireVerifiedEmail("alice@example.com")).thenReturn(Mono.empty());
        when(authService.signup(anyString(), anyString(), anyString(), anyString()))
                .thenReturn(Mono.error(new RuntimeException("database unavailable")));

        client.post().uri("/auth/signup").contentType(MediaType.APPLICATION_JSON).bodyValue("{\"username\":\"alice\",\"email\":\"alice@example.com\",\"password\":\"password123\",\"role\":\"Buyer\"}")
                .exchange().expectStatus().is5xxServerError();

        verify(verificationStore, never()).consumeVerifiedEmail(anyString());
    }

    @Test
    void signup_shouldConsumeVerificationOnlyAfterSuccessfulPersistenceAndSetCookies() {
        User user = user("alice@example.com", "Buyer");
        when(verificationStore.requireVerifiedEmail("alice@example.com")).thenReturn(Mono.empty());
        when(authService.signup(anyString(), eq("alice@example.com"), anyString(), anyString())).thenReturn(Mono.just(user));
        when(verificationStore.consumeVerifiedEmail("alice@example.com")).thenReturn(Mono.empty());

        client.post().uri("/auth/signup").contentType(MediaType.APPLICATION_JSON).bodyValue("{\"username\":\"alice\",\"email\":\"alice@example.com\",\"password\":\"password123\",\"role\":\"Buyer\"}")
                .exchange().expectStatus().isOk().expectHeader().valueMatches("Set-Cookie", ".*access_token=.*")
                .expectBody().jsonPath("$.role").isEqualTo("Buyer");

        verify(verificationStore).consumeVerifiedEmail("alice@example.com");
    }

    @Test
    void loginMeRefreshAndLogout_shouldUseCookieAuthenticationContract() {
        User user = user("buyer@example.com", "Buyer");
        when(authService.authenticateEmail("buyer@example.com", "password123")).thenReturn(Mono.just(user));
        client.post().uri("/auth/login").contentType(MediaType.APPLICATION_JSON).bodyValue("{\"email\":\"buyer@example.com\",\"password\":\"password123\"}")
                .exchange().expectStatus().isOk().expectHeader().exists("Set-Cookie");

        String access = jwtService.generateAccessToken("buyer@example.com", "Buyer");
        when(users.findByEmail("buyer@example.com")).thenReturn(Mono.just(user));
        client.get().uri("/auth/me").cookie("access_token", access).exchange().expectStatus().isOk()
                .expectBody().jsonPath("$.hashedPassword").doesNotExist().jsonPath("$.secretSalt").doesNotExist();

        client.get().uri("/auth/me").exchange().expectStatus().isUnauthorized();

        String refresh = jwtService.generateRefreshToken("buyer@example.com", "Buyer");
        client.post().uri("/auth/refresh").cookie("refresh_token", refresh).exchange().expectStatus().isOk()
                .expectHeader().valueMatches("Set-Cookie", ".*access_token=.*");

        client.post().uri("/auth/logout").exchange().expectStatus().isOk()
                .expectHeader().valueMatches("Set-Cookie", ".*Max-Age=0.*");
    }

    @Test
    void walletLogin_shouldRequireWalletAndCreateSessionForValidWallet() {
        when(authService.walletLogin(isNull(), anyString(), anyString()))
                .thenReturn(Mono.error(new IllegalArgumentException("Wallet address is required.")));
        client.post().uri("/auth/wallet-login").contentType(MediaType.APPLICATION_JSON).bodyValue("{\"username\":\"alice\",\"role\":\"Buyer\"}")
                .exchange().expectStatus().isBadRequest();

        when(authService.walletLogin("0xabc", "alice", "Creator")).thenReturn(Mono.just(user("0xabc", "Creator")));
        client.post().uri("/auth/wallet-login").contentType(MediaType.APPLICATION_JSON).bodyValue("{\"walletAddress\":\"0xabc\",\"username\":\"alice\",\"role\":\"Creator\"}")
                .exchange().expectStatus().isOk().expectBody().jsonPath("$.role").isEqualTo("Creator");
    }

    private User user(String identity, String role) {
        boolean wallet = identity.startsWith("0x");
        return new User(UUID.randomUUID(), "alice", wallet ? null : identity, wallet ? null : "$2a$10$hash",
                wallet ? identity : null, role, 0.0, 0L, 0.0, 0.0, "salt", null);
    }
}
