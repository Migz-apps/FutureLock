package com.futurelock.vault;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import reactor.core.publisher.Hooks;

@SpringBootApplication
@EnableCaching
public class FutureLockVaultApplication {
    public static void main(String[] args) {
        // Enable Project Reactor's metric hooks for backpressure and monitoring
        Hooks.enableAutomaticContextPropagation();
        SpringApplication.run(FutureLockVaultApplication.java, args);
    }
}
