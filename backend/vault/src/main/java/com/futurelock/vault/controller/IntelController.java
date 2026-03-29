package com.futurelock.vault.controller;

import com.futurelock.vault.model.IntelMetadata;
import com.futurelock.vault.service.MarketplaceService;
import com.futurelock.vault.repository.IntelMetadataRepository;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;
import com.futurelock.vault.dto.IntelResponse;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/intel")
public class IntelController {

    private final MarketplaceService marketplaceService;
    private final IntelMetadataRepository repository;

    public IntelController(MarketplaceService marketplaceService, IntelMetadataRepository repository) {
        this.marketplaceService = marketplaceService;
        this.repository = repository;
    }

    @GetMapping("/public")
    public Flux<IntelMetadata> getPublicIntel(
            @RequestParam(required = false) String query,
            @RequestParam(required = false, defaultValue = "All") String category) {
        return marketplaceService.getFilteredIntel(query, category);
    }
    
    @PostMapping("/{intelId}/rate")
    public Mono<IntelMetadata> rateIntel(@PathVariable UUID intelId, @RequestParam double rating) {
        if (rating < 0.0 || rating > 5.0) {
            return Mono.error(new IllegalArgumentException("Rating must be between 0 and 5"));
        }
        return marketplaceService.rateIntel(intelId, rating);
    }

    @PostMapping("/create")
    public Mono<Map<String, Object>> createInsight(
            @RequestParam String title,
            @RequestParam String content,
            @RequestParam String unlockDate, // matching CamelCase from front end
            @RequestParam String creator) {
        
        String mockCid = "ipfs_hash_" + System.currentTimeMillis();
        
        IntelMetadata meta = new IntelMetadata(
                UUID.randomUUID(), title, "Encrypted Intelligence", 
                new BigDecimal("0.05"), new BigDecimal("150.00"), "All", creator, 
                7, 0.0, 0L, OffsetDateTime.parse(unlockDate), 0L
        );
        
        return repository.save(meta)
                .map(saved -> Map.of(
                        "status", "locked",
                        "cid", mockCid,
                        "unlock_at", unlockDate
                ));
    }
}
