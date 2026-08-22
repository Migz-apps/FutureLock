package com.futurelock.vault.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.OffsetDateTime;
import java.util.UUID;

@Table("ratings")
public record Rating(

        @Id
        UUID id,

        @Column("user_id")
        UUID userId,

        @Column("intel_id")
        UUID intelId,

        @Column("score")
        Integer score,

        @Column("is_dispute")
        Boolean isDispute,

        @Column("rated_at")
        OffsetDateTime ratedAt,

        @Version
        @Column("version")
        Long version
) {
}
