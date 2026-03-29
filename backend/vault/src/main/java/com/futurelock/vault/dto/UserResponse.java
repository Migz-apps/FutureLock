package com.futurelock.vault.dto;

import java.util.UUID;
import jakarta.validation.constraints.*;
import java.time.OffsetDateTime;
import java.math.BigDecimal;

/**
 * DTO for returning User profile information.
 * Excludes sensitive fields like hashedPassword and secretSalt.
 */
public record UserResponse(
    UUID id,
    String username,
    String email,
    String walletAddress,
    String role,
    Double trustScore,
    Long ratingsCount,
    Double totalWeightedScore,
    Double totalWeightSum
) {}