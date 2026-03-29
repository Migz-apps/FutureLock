package com.futurelock.vault.service;

import java.time.OffsetDateTime;
import org.springframework.stereotype.Service;

@Service
public class TimeLockValidator {
    /**
     * Calculates if the intelligence is past its unlock date.
     * Uses java.time.OffsetDateTime for precise lock moments.
     */
    public boolean isUnlocked(OffsetDateTime purchaseDate, int unlockDays) {
        OffsetDateTime unlockMoment = purchaseDate.plusDays(unlockDays);
        return OffsetDateTime.now().isAfter(unlockMoment);
    }
}
