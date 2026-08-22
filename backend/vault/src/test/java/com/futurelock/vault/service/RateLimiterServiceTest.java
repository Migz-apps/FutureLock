package com.futurelock.vault.service;

import com.futurelock.vault.model.EmailVerification;
import com.futurelock.vault.repository.EmailVerificationRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.time.OffsetDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class RateLimiterServiceTest {
    @Test
    void request_shouldStoreOnlyHashAndFiveMinuteExpiry() {
        EmailVerificationRepository repository = mock(EmailVerificationRepository.class);
        when(repository.findById("alice@example.com")).thenReturn(Mono.empty());
        when(repository.save(any(EmailVerification.class))).thenAnswer(invocation -> Mono.just(invocation.getArgument(0)));
        RateLimiterService service = new RateLimiterService(repository);
        OffsetDateTime before = OffsetDateTime.now();

        StepVerifier.create(service.checkLimitAndStore(" Alice@Example.COM ", "123456")).verifyComplete();

        ArgumentCaptor<EmailVerification> saved = ArgumentCaptor.forClass(EmailVerification.class);
        verify(repository).save(saved.capture());
        assertEquals("alice@example.com", saved.getValue().email());
        assertNotEquals("123456", saved.getValue().codeHash());
        assertEquals(64, saved.getValue().codeHash().length());
        assertTrue(saved.getValue().expiresAt().isAfter(before.plusMinutes(4)));
        assertTrue(saved.getValue().expiresAt().isBefore(before.plusMinutes(6)));
        assertFalse(saved.getValue().verified());
    }

    @Test
    void confirmation_shouldMarkRecordVerifiedWithoutDeletingIt() {
        EmailVerificationRepository repository = mock(EmailVerificationRepository.class);
        RateLimiterService service = new RateLimiterService(repository);
        when(repository.findById("alice@example.com")).thenReturn(Mono.empty());
        when(repository.save(any(EmailVerification.class))).thenAnswer(invocation -> Mono.just(invocation.getArgument(0)));
        StepVerifier.create(service.checkLimitAndStore("alice@example.com", "123456")).verifyComplete();
        ArgumentCaptor<EmailVerification> initial = ArgumentCaptor.forClass(EmailVerification.class);
        verify(repository).save(initial.capture());
        when(repository.findById("alice@example.com")).thenReturn(Mono.just(initial.getValue()));

        StepVerifier.create(service.validateCode("ALICE@example.com", " 123456 "))
                .expectNext(true).verifyComplete();
        verify(repository, never()).deleteById("alice@example.com");
    }
}
