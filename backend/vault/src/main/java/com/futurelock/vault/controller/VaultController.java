package com.futurelock.vault.controller;

import com.futurelock.vault.model.PurchaseHistory;
import com.futurelock.vault.model.VaultItem;
import com.futurelock.vault.repository.IntelMetadataRepository;
import com.futurelock.vault.repository.PurchaseHistoryRepository;
import com.futurelock.vault.service.EncryptionService;
import com.futurelock.vault.service.TimeLockValidator;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class VaultController {

    private final PurchaseHistoryRepository purchaseRepo;
    private final IntelMetadataRepository intelRepo;
    private final EncryptionService encryptionService;
    private final TimeLockValidator timeLockValidator;

    public VaultController(PurchaseHistoryRepository purchaseRepo, IntelMetadataRepository intelRepo, 
                           EncryptionService encryptionService, TimeLockValidator timeLockValidator) {
        this.purchaseRepo = purchaseRepo;
        this.intelRepo = intelRepo;
        this.encryptionService = encryptionService;
        this.timeLockValidator = timeLockValidator;
    }

    @GetMapping("/buyer/vault")
    public Flux<VaultItem> getBuyerVault(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = jwt != null && jwt.getSubject() != null ? UUID.fromString(jwt.getSubject()) : UUID.randomUUID();
        
        return purchaseRepo.findByUserId(userId)
            .flatMap(purchase -> intelRepo.findById(purchase.intelId())
                .map(meta -> VaultItem.from(meta, purchase, true, "encrypted_payload_placeholder")));
    }

    @PostMapping("/purchase")
    public Mono<VaultItem> purchaseIntel(@AuthenticationPrincipal Jwt jwt, @RequestBody PurchaseRequest request) {
        UUID userId = jwt != null && jwt.getSubject() != null ? UUID.fromString(jwt.getSubject()) : UUID.randomUUID();
        return intelRepo.findById(request.intelId())
            .flatMap(meta -> {
                PurchaseHistory history = new PurchaseHistory(UUID.randomUUID(), userId, meta.id(), request.txHash(), OffsetDateTime.now());
                return purchaseRepo.save(history).map(h -> VaultItem.from(meta, h, true, "encrypted_payload_placeholder"));
            });
    }

    @PostMapping("/buyer/vault/{intelId}/decrypt")
    public Mono<Map<String, String>> decryptPayload(@AuthenticationPrincipal Jwt jwt, 
                                                    @PathVariable UUID intelId,
                                                    @RequestBody DecryptRequest request) {
        UUID userId = jwt != null && jwt.getSubject() != null ? UUID.fromString(jwt.getSubject()) : UUID.randomUUID();
        
        return purchaseRepo.findByUserIdAndIntelId(userId, intelId)
            .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.FORBIDDEN, "Not purchased")))
            .flatMap(purchase -> intelRepo.findById(intelId)
                .flatMap(meta -> {
                    // Core Time Lock validation logic check
                    if (!timeLockValidator.isUnlocked(purchase.purchaseDate(), meta.unlockDays())) {
                        return Mono.error(new ResponseStatusException(HttpStatus.LOCKED, "Intelligence is still time-locked"));
                    }
                    
                    // Here we'd fetch the actual encrypted blob from a Database or S3.
                    String realEncryptedBlob = "simulated_encrypted_blob_from_db"; 
                    
                    // Secure Decryption Offloaded to Virtual Thread (Project Loom)
                    return encryptionService.decrypt(realEncryptedBlob, request.decryptionKey())
                        .map(decrypted -> Map.of("payload", decrypted));
                }));
    }
}

record PurchaseRequest(UUID intelId, String txHash) {}
record DecryptRequest(String decryptionKey) {}
