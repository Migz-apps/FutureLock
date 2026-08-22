package com.futurelock.vault.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Table("intel_metadata")
public record IntelMetadata(

        @Id
        UUID id,

        @Column("title")
        String title,

        @Column("description")
        String description,

        @JsonFormat(shape = JsonFormat.Shape.STRING)
        @Column("price_eth")
        BigDecimal priceETH,

        @Column("price_usd")
        BigDecimal priceUSD,

        @Column("category")
        String category,

        @Column("creator")
        String creator,

        @Column("unlock_days")
        Integer unlockDays,

        @Column("trust_score")
        Double trustScore,

        @Column("ratings_count")
        Long ratingsCount,

        @Column("created_at")
        OffsetDateTime createdAt,

        @Version
        @Column("version")
        Long version
) {
}
