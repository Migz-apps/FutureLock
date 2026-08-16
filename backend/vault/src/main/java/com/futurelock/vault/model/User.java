package com.futurelock.vault.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.util.UUID;

@Table("users")
public record User(
        @Id UUID id,
        String username,
        String email,
        String hashedPassword,
        String walletAddress,
        String role,
        Double trustScore,
        Long ratingsCount,
        Double totalWeightedScore,
        Double totalWeightSum,
        String secretSalt
) {
}
