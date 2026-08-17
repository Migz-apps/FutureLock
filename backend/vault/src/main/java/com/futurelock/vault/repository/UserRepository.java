package com.futurelock.vault.repository;

import com.futurelock.vault.model.User;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Repository
public interface UserRepository
        extends ReactiveCrudRepository<User, UUID> {

    Mono<User> findByEmail(String email);

    Mono<User> findByUsername(String username);

    Mono<User> findByWalletAddress(String walletAddress);
}