package com.futurelock.vault.repository;

import com.futurelock.vault.model.*;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Flux;
import org.springframework.stereotype.Repository;

import java.util.UUID;

public interface UserRepository extends ReactiveCrudRepository<User, UUID> {
    Mono<User> findByEmail(String email);
    Mono<User> findByUsername(String username);
    Mono<User> findByWalletAddress(String walletAddress);
}
