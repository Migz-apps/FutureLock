package com.futurelock.vault.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.UUID;
import java.time.OffsetDateTime;

public record RatingRequest(
    @NotNull(message = "Intel ID is required")
    UUID intelId,

    @NotNull(message = "Score is required")
    @Min(1) @Max(5)
    Integer score,

    Boolean isDispute
) {}