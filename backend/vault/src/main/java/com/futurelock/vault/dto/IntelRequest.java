package com.futurelock.vault.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.*;
import java.util.UUID;
import java.time.OffsetDateTime;
import java.math.BigDecimal;

public record IntelRequest(
    @NotBlank(message = "Title is required")
    String title,

    @NotBlank(message = "Description is required")
    String description,

    @NotNull(message = "Price in ETH is required")
    @DecimalMin(value = "0.0", inclusive = false)
    BigDecimal priceETH,

    @NotBlank(message = "Category is required")
    String category,

    @NotNull(message = "Unlock days duration is required")
    Integer unlockDays
) {}