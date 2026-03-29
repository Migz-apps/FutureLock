package com.futurelock.vault.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;
import java.time.OffsetDateTime;
import java.util.UUID;

@Table("purchase_history")
public record PurchaseHistory(
    @Id UUID id,
    UUID userId,
    UUID intelId,
    String transactionHash,
    OffsetDateTime purchaseDate // Lock validation threshold base point
) {}
