package com.futurelock.vault.controller;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.Map;
import java.util.concurrent.ExecutorService;

@RestController
@RequestMapping("/api/system")
public class HealthMonitoringController {

    private final ExecutorService virtualThreadExecutor;

    public HealthMonitoringController(@Qualifier("virtualThreadExecutor") ExecutorService virtualThreadExecutor) {
        this.virtualThreadExecutor = virtualThreadExecutor;
    }

    @GetMapping("/healthcheck")
    public Mono<Map<String, Object>> customHealthCheck() {
        Runtime runtime = Runtime.getRuntime();
        long usedMemory = (runtime.totalMemory() - runtime.freeMemory()) / 1024 / 1024;
        long maxMemory = runtime.maxMemory() / 1024 / 1024;

        return Mono.just(Map.of(
            "status", "UP",
            "memoryUsedMB", usedMemory,
            "memoryMaxMB", maxMemory,
            "virtualThreadsActive", "Managed by JVM Project Loom (Dynamic Allocation)",
            "message", "Zero-latency active"
        ));
    }
}
