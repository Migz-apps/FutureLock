package com.futurelock.vault.dto;

import java.util.UUID;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record AuthResponse(
    @NotBlank String accessToken,
    @NotBlank String refreshToken,
    @NotNull UUID userId,
    @NotBlank String username,
    @NotBlank String role,
    @NotBlank String identityType,
    @NotBlank String identity,
    @NotNull Double trustScore,
    @NotNull Long ratingsCount
) {}