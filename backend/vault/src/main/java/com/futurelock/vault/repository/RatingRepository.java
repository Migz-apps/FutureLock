package com.futurelock.vault.repository;

import com.futurelock.vault.model.*;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

/**
 * Reactive Repository for Rating entities.
 * Supports non-blocking database operations for high-concurrency intelligence auditing.
 */
@Repository
public interface RatingRepository extends ReactiveCrudRepository<Rating, UUID> {

    /**
     * Finds all ratings submitted by a specific user.
     * Matches the UUID 'userId' field in Rating.java[cite: 58].
     */
    Flux<Rating> findByUserId(UUID userId);

    /**
     * Finds all ratings for a specific intelligence item.
     * Matches the UUID 'intelId' field in Rating.java[cite: 60].
     */
    Flux<Rating> findByIntelId(UUID intelId);

    /**
     * Finds all ratings marked as a dispute.
     * Replaces the Python is_dispute filtering logic[cite: 64].
     */
    Flux<Rating> findByIsDisputeTrue();
}