package com.futurelock.vault.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.reactor.netty.NettyReactiveWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import reactor.netty.resources.LoopResources;
import org.springframework.web.reactive.config.CorsRegistry;
import org.springframework.web.reactive.config.WebFluxConfigurer;

@Configuration
public class GlobalConfig {

    /**
     * VirtualThreadPerTaskExecutor for CPU-bound offloading.
     * Uses Project Loom (JDK 21) Lightweight Threads.
     */
    @Bean(name = "virtualThreadExecutor")
    public ExecutorService virtualThreadExecutor() {
        return Executors.newVirtualThreadPerTaskExecutor();
    }

    /**
     * Netty Optimization for handling 5M+ concurrent connections.
     * Increases selector and worker threads based on available CPU cores.
     */
    @Bean
    public WebServerFactoryCustomizer<NettyReactiveWebServerFactory> nettyCustomizer() {
        return factory -> factory.addServerCustomizers(httpServer -> {
            int cores = Runtime.getRuntime().availableProcessors();
            // Tuning Netty event loop count for massive connections
            LoopResources loop = LoopResources.create("futurelock-netty", cores * 2, cores * 16, true);
            return httpServer.runOn(loop);
        });
    }
}
