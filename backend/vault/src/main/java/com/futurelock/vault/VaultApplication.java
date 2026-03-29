package com.futurelock.vault;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.r2dbc.repository.config.EnableR2dbcRepositories;
import org.springframework.cache.annotation.EnableCaching;
import reactor.core.publisher.Hooks;

@SpringBootApplication
@EnableR2dbcRepositories
@EnableCaching
public class VaultApplication {

	public static void main(String[] args) {
		Hooks.enableAutomaticContextPropagation();
		SpringApplication.run(VaultApplication.class, args);
	}

}
