package com.futurelock.vault.integration;

import com.futurelock.vault.repository.UserRepository;
import com.futurelock.vault.service.RateLimiterService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webtestclient.autoconfigure.AutoConfigureWebTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.reactive.server.WebTestClient;
import reactor.test.StepVerifier;

import java.util.UUID;

/** Requires a dedicated TEST_DB with V1__initial_schema.sql already applied. */
@Tag("database-integration")
@ActiveProfiles("test")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureWebTestClient
@EnabledIfEnvironmentVariable(named = "TEST_DB_URL", matches = ".+")
class AuthApiDatabaseIntegrationTest {
    @Autowired WebTestClient client;
    @Autowired RateLimiterService verificationStore;
    @Autowired UserRepository users;

    private final String email = "integration-" + UUID.randomUUID() + "@example.test";

    @AfterEach
    void cleanUpDisposableAccount() {
        StepVerifier.create(users.findByEmail(email).flatMap(users::delete).then()).verifyComplete();
    }

    @Test
    void verifiedSignup_shouldPersistNormalizedUserAndAllowLogin() {
        StepVerifier.create(verificationStore.checkLimitAndStore(email, "123456")).verifyComplete();
        StepVerifier.create(verificationStore.validateCode(email.toUpperCase(), "123456"))
                .expectNext(true).verifyComplete();

        client.post().uri("/auth/signup")
                .bodyValue("{\"username\":\" Integration User \",\"email\":\" " + email.toUpperCase()
                        + " \",\"password\":\"integration-password\",\"role\":\"Buyer\"}")
                .exchange().expectStatus().isOk().expectBody()
                .jsonPath("$.role").isEqualTo("Buyer")
                .jsonPath("$.identity").isEqualTo(email);

        StepVerifier.create(users.findByEmail(email))
                .assertNext(user -> {
                    org.junit.jupiter.api.Assertions.assertEquals("integration user", user.username());
                    org.junit.jupiter.api.Assertions.assertTrue(user.hashedPassword().startsWith("$2"));
                    org.junit.jupiter.api.Assertions.assertNotNull(user.id());
                    org.junit.jupiter.api.Assertions.assertNotNull(user.secretSalt());
                }).verifyComplete();

        client.post().uri("/auth/login")
                .bodyValue("{\"email\":\"" + email + "\",\"password\":\"integration-password\"}")
                .exchange().expectStatus().isOk().expectHeader().exists("Set-Cookie");
    }
}
