package com.futurelock.vault.dto;

import jakarta.validation.constraints.*;
import java.util.UUID;
import java.time.OffsetDateTime;
import java.math.BigDecimal;

public record WalletLoginRequest(
    @NotBlank(message = "Wallet address is required")
    String walletAddress,
    
    String username, // Optional for existing users, required for new ones
    
    @NotBlank(message = "Role is required")
    String role
) {}