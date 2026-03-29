package com.futurelock.vault.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Reactive Data Model for Intelligence Ratings.
 * Replaces the Python Rating class with Spring Data R2DBC compatibility.
 */
@Table("ratings")
public record Rating(
    @Id 
    UUID id,
    
    // Links to User.java UUID id [cite: 8]
    UUID userId,
    
    // Links to IntelMetadata.java UUID id [cite: 30]
    UUID intelId,
    
    // The numerical rating (1-5 or 1-10 depending on your scale)
    Integer score,
    
    // Replaces Python is_dispute = Column(Boolean, default=False)
    Boolean isDispute,
    
    // Timestamp for when the rating was submitted
    OffsetDateTime ratedAt
) {}