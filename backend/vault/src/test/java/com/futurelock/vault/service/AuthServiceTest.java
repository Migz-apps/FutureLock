package com.futurelock.vault.service;

import com.futurelock.vault.model.User;
import com.futurelock.vault.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class AuthServiceTest {
    private UserRepository users;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        users = mock(UserRepository.class);
        authService = new AuthService(users);
        when(users.findByUsername(anyString())).thenReturn(Mono.empty());
        when(users.findByEmail(anyString())).thenReturn(Mono.empty());
    }

    @Test
    void signup_shouldNormalizeAndPersistSecuredBuyer() {
        when(users.save(any(User.class))).thenAnswer(invocation -> Mono.just(invocation.getArgument(0)));

        StepVerifier.create(authService.signup("  Alice ", " Alice@Example.COM ", "password123", "unknown"))
                .assertNext(user -> {
                    assertNotNull(user.id());
                    assertEquals("alice", user.username());
                    assertEquals("alice@example.com", user.email());
                    assertEquals("Buyer", user.role());
                    assertNotEquals("password123", user.hashedPassword());
                    assertTrue(user.hashedPassword().startsWith("$2"));
                    assertEquals(0.0, user.trustScore());
                    assertEquals(0L, user.ratingsCount());
                    assertNotNull(user.secretSalt());
                    assertNull(user.version(), "null version marks a preassigned UUID entity as new for R2DBC");
                }).verifyComplete();

        verify(users).save(any(User.class));
    }

    @Test
    void signup_shouldNotAttemptSaveForDuplicateEmail() {
        User existing = user("existing@example.com", "Buyer");
        when(users.findByEmail("existing@example.com")).thenReturn(Mono.just(existing));

        StepVerifier.create(authService.signup("new", "existing@example.com", "password123", "Buyer"))
                .expectErrorMatches(error -> error instanceof IllegalStateException
                        && error.getMessage().contains("Email already registered"))
                .verify();

        verify(users, never()).save(any());
    }

    @Test
    void signup_shouldRejectShortPasswordWithoutPersistence() {
        StepVerifier.create(authService.signup("new", "new@example.com", "short", "Creator"))
                .expectErrorMatches(error -> error instanceof IllegalArgumentException
                        && error.getMessage().contains("at least 8"))
                .verify();
        verify(users, never()).save(any());
    }

    @Test
    void walletLogin_shouldNormalizeWalletAndPersistCreator() {
        when(users.findByWalletAddress("0xabc")).thenReturn(Mono.empty());
        when(users.save(any(User.class))).thenAnswer(invocation -> Mono.just(invocation.getArgument(0)));

        StepVerifier.create(authService.walletLogin(" 0xABC ", "Creator Name", "creator"))
                .assertNext(user -> {
                    assertEquals("0xabc", user.walletAddress());
                    assertEquals("creator name", user.username());
                    assertEquals("Creator", user.role());
                    assertNull(user.hashedPassword());
                }).verifyComplete();
    }

    @Test
    void authenticateEmail_shouldRejectIncorrectPassword() {
        User secured = user("buyer@example.com", "Buyer");
        secured = new User(secured.id(), secured.username(), secured.email(),
                new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder().encode("correct-password"),
                null, secured.role(), 0.0, 0L, 0.0, 0.0, "salt", null);
        when(users.findByEmail("buyer@example.com")).thenReturn(Mono.just(secured));

        StepVerifier.create(authService.authenticateEmail("BUYER@EXAMPLE.COM", "wrong-password"))
                .expectError(org.springframework.web.server.ResponseStatusException.class)
                .verify();
    }

    private User user(String email, String role) {
        return new User(java.util.UUID.randomUUID(), "user", email, "$2a$10$abcdefghijklmnopqrstuv", null,
                role, 0.0, 0L, 0.0, 0.0, "salt", null);
    }
}
