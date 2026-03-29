package com.futurelock.vault.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;
import jakarta.validation.constraints.*;


public record IntelResponse(
    @NotNull UUID id,
    @NotBlank String title,
    @NotBlank String description,
    @NotNull BigDecimal priceETH,
    @NotNull BigDecimal priceUSD,
    @NotBlank String category,
    @NotBlank String creator,
    @NotNull Double trustScore,
    @NotNull Long ratingsCount,
    @NotNull OffsetDateTime createdAt
) {}