package com.futurelock.vault.repository;

import com.futurelock.vault.model.Rating;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

import java.util.UUID;

@Repository
public interface RatingRepository
        extends ReactiveCrudRepository<Rating, UUID> {

    Flux<Rating> findByUserId(UUID userId);

    Flux<Rating> findByIntelId(UUID intelId);

    Flux<Rating> findByIsDisputeTrue();
}