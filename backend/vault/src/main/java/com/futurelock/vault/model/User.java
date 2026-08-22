package com.futurelock.vault.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.util.UUID;

@Table("users")
public record User(

        @Id
        UUID id,

        @Column("username")
        String username,

        @Column("email")
        String email,

        @Column("hashed_password")
        String hashedPassword,

        @Column("wallet_address")
        String walletAddress,

        @Column("role")
        String role,

        @Column("trust_score")
        Double trustScore,

        @Column("ratings_count")
        Long ratingsCount,

        @Column("total_weighted_score")
        Double totalWeightedScore,

        @Column("total_weight_sum")
        Double totalWeightSum,

        @Column("secret_salt")
        String secretSalt,

        @Version
        @Column("version")
        Long version
) {
}
