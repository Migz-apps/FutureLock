package com.futurelock.vault.dto;

import jakarta.validation.constraints.*;
import java.util.UUID;
import java.time.OffsetDateTime;
import java.math.BigDecimal;

public record LoginRequest(
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    String email,

    @NotBlank(message = "Password is required")
    String password
) {}