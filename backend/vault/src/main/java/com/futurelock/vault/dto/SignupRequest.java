package com.futurelock.vault.dto;

import jakarta.validation.constraints.*;
import java.util.UUID;
import java.time.OffsetDateTime;
import java.math.BigDecimal;

public record SignupRequest(
    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 20)
    String username,

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    String email,

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    String password,

    @NotBlank(message = "Role is required")
    String role
) {}