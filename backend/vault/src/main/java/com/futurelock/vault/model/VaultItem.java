package com.futurelock.vault.model;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record VaultItem(

        UUID id,

        String title,

        String description,

        @JsonFormat(shape = JsonFormat.Shape.STRING)
        BigDecimal priceETH,

        BigDecimal priceUSD,

        String category,

        String creator,

        Integer unlockDays,

        Double trustScore,

        Long ratingsCount,

        OffsetDateTime createdAt,

        boolean hasAccess,

        String encryptedPayload,

        OffsetDateTime purchaseDate
) {

    public static VaultItem from(
            IntelMetadata meta,
            PurchaseHistory history,
            boolean hasAccess,
            String encryptedPayload
    ) {

        return new VaultItem(
                meta.id(),
                meta.title(),
                meta.description(),
                meta.priceETH(),
                meta.priceUSD(),
                meta.category(),
                meta.creator(),
                meta.unlockDays(),
                meta.trustScore(),
                meta.ratingsCount(),
                meta.createdAt(),
                hasAccess,
                encryptedPayload,
                history != null ? history.purchaseDate() : null
        );
    }
}