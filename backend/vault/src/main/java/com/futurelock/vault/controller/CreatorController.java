package com.futurelock.vault.controller;

import com.futurelock.vault.model.IntelMetadata;
import com.futurelock.vault.model.PurchaseHistory;
import com.futurelock.vault.repository.IntelMetadataRepository;
import com.futurelock.vault.repository.PurchaseHistoryRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/creator")
public class CreatorController {

    private final IntelMetadataRepository intelRepo;
    private final PurchaseHistoryRepository purchaseRepo;

    public CreatorController(IntelMetadataRepository intelRepo, PurchaseHistoryRepository purchaseRepo) {
        this.intelRepo = intelRepo;
        this.purchaseRepo = purchaseRepo;
    }

    @GetMapping("/analytics")
    public Mono<Map<String, Object>> getCreatorAnalytics(@AuthenticationPrincipal Jwt jwt) {
        String identity = jwt != null ? jwt.getSubject() : "dummy_creator"; // Ideally query User to get actual username/wallet

        return intelRepo.findByCreator(identity)
                .collectList()
                .flatMap(insights -> {
                    List<UUID> insightIds = insights.stream().map(IntelMetadata::id).collect(Collectors.toList());
                    return purchaseRepo.findAll() // Using a simplified findAll for reactive context parity, optimize via custom query in production
                            .filter(p -> insightIds.contains(p.intelId()))
                            .collectList()
                            .map(purchases -> {
                                double totalEarningsEth = insights.stream().mapToDouble(i -> i.priceETH() != null ? i.priceETH().doubleValue() : 0.0).sum();
                                int totalIntelSold = purchases.size();

                                return Map.of(
                                        "total_earnings_eth", totalEarningsEth,
                                        "total_earnings_usd", totalEarningsEth * 3000,
                                        "total_intel_sold", totalIntelSold,
                                        "chart_data", List.of(), // Mapped logically over time in production bounds
                                        "active_locks", insights.stream().map(ins -> Map.of(
                                                "id", ins.id(),
                                                "title", ins.title(),
                                                "release_date", ins.createdAt() != null ? ins.createdAt().plusDays(ins.unlockDays()) : null
                                        )).collect(Collectors.toList())
                                );
                            });
                });
    }
}
