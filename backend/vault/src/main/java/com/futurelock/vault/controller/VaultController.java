package com.futurelock.vault.controller;

import com.futurelock.vault.model.PurchaseHistory;
import com.futurelock.vault.model.User;
import com.futurelock.vault.model.VaultItem;
import com.futurelock.vault.repository.IntelMetadataRepository;
import com.futurelock.vault.repository.PurchaseHistoryRepository;
import com.futurelock.vault.repository.UserRepository;
import com.futurelock.vault.service.EncryptionService;
import com.futurelock.vault.service.TimeLockValidator;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
    private final UserRepository userRepo;
    private final EncryptionService encryptionService;
    private final TimeLockValidator timeLockValidator;

    public VaultController(PurchaseHistoryRepository purchaseRepo, IntelMetadataRepository intelRepo,
                           UserRepository userRepo, EncryptionService encryptionService,
                           TimeLockValidator timeLockValidator) {
        this.purchaseRepo = purchaseRepo;
        this.intelRepo = intelRepo;
        this.userRepo = userRepo;
        this.encryptionService = encryptionService;
        this.timeLockValidator = timeLockValidator;
    }

    @GetMapping("/buyer/vault")
    public Flux<VaultItem> getBuyerVault(@AuthenticationPrincipal String identity) {
        return currentUser(identity).flatMapMany(user -> purchaseRepo.findByUserId(user.id())
                .flatMap(purchase -> intelRepo.findById(purchase.intelId())
                        .map(meta -> VaultItem.from(meta, purchase, true, "encrypted_payload_placeholder"))));
    }

    @PostMapping("/purchase")
    public Mono<VaultItem> purchaseIntel(@AuthenticationPrincipal String identity, @RequestBody PurchaseRequest request) {
        return currentUser(identity).flatMap(user -> intelRepo.findById(request.intelId())
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "Intelligence not found")))
                .flatMap(meta -> purchaseRepo.save(new PurchaseHistory(UUID.randomUUID(), user.id(), meta.id(),
                        request.txHash(), OffsetDateTime.now(), null))
                        .map(saved -> VaultItem.from(meta, saved, true, "encrypted_payload_placeholder"))));
    }

    @PostMapping("/buyer/vault/{intelId}/decrypt")
    public Mono<Map<String, String>> decryptPayload(@AuthenticationPrincipal String identity,
                                                     @PathVariable UUID intelId,
                                                     @RequestBody DecryptRequest request) {
        return currentUser(identity).flatMap(user -> purchaseRepo.findByUserIdAndIntelId(user.id(), intelId)
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.FORBIDDEN, "Not purchased")))
                .flatMap(purchase -> intelRepo.findById(intelId).flatMap(meta -> {
                    if (!timeLockValidator.isUnlocked(purchase.purchaseDate(), meta.unlockDays())) {
                        return Mono.error(new ResponseStatusException(HttpStatus.LOCKED, "Intelligence is still time-locked"));
                    }
                    return encryptionService.decrypt("simulated_encrypted_blob_from_db", request.decryptionKey())
                            .map(decrypted -> Map.of("payload", decrypted));
                })));
    }

    private Mono<User> currentUser(String identity) {
        return userRepo.findByEmail(identity).switchIfEmpty(userRepo.findByWalletAddress(identity))
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required")));
    }
}

record PurchaseRequest(UUID intelId, String txHash) {}
record DecryptRequest(String decryptionKey) {}
