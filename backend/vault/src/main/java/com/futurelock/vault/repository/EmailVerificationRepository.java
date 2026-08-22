package com.futurelock.vault.repository;

import com.futurelock.vault.model.EmailVerification;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmailVerificationRepository extends ReactiveCrudRepository<EmailVerification, String> {}
