package com.futurelock.vault.repository;

import com.futurelock.vault.model.PurchaseHistory;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Repository
public interface PurchaseHistoryRepository
        extends ReactiveCrudRepository<PurchaseHistory, UUID> {

    Flux<PurchaseHistory> findByUserId(UUID userId);

    Mono<PurchaseHistory> findByUserIdAndIntelId(
            UUID userId,
            UUID intelId
    );

    Mono<Boolean> existsByUserIdAndIntelId(
            UUID userId,
            UUID intelId
    );
}