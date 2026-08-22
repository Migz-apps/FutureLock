package com.futurelock.vault.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.OffsetDateTime;
import java.util.UUID;

@Table("purchase_history")
public record PurchaseHistory(

        @Id
        UUID id,

        @Column("user_id")
        UUID userId,

        @Column("intel_id")
        UUID intelId,

        @Column("transaction_hash")
        String transactionHash,

        @Column("purchase_date")
        OffsetDateTime purchaseDate,

        @Version
        @Column("version")
        Long version
) {
}
