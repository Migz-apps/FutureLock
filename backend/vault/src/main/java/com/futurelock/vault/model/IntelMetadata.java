package com.futurelock.vault.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Table("intel_metadata")
public record IntelMetadata(
    @Id UUID id,
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
    
    OffsetDateTime createdAt, // Defines exact creation moment for Time Lock
    
    @Version Long version // Spring Data automated Optimistic Locking field
) {}
