package com.futurelock.vault.repository;

import com.futurelock.vault.model.*;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import org.springframework.stereotype.Repository;

import java.util.UUID;

public interface PurchaseHistoryRepository extends ReactiveCrudRepository<PurchaseHistory, UUID> {
    Flux<PurchaseHistory> findByUserId(UUID userId);
    Mono<PurchaseHistory> findByUserIdAndIntelId(UUID userId, UUID intelId);
    Mono<Boolean> existsByUserIdAndIntelId(UUID userId, UUID intelId);
}
