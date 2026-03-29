package com.futurelock.vault.service;

import com.futurelock.vault.model.User;
import com.futurelock.vault.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.Map;
import java.util.UUID;

/**
 * Service handling high-concurrency authentication logic for FutureLock.
 * Replaces the Python auth.py functionality with Reactive Streams.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    /**
     * Replaces Python signup/register logic.
     * Handles duplicate checks and reactive user creation.
     */
    public Mono<User> signup(String username, String email, String password, String role) {
        String normalizedUsername = username.toLowerCase();

        return userRepository.findByUsername(normalizedUsername)
                .flatMap(exists -> Mono.<User>error(new RuntimeException("Username already claimed")))
                .switchIfEmpty(userRepository.findByEmail(email))
                .flatMap(exists -> Mono.<User>error(new RuntimeException("Email already registered")))
                .switchIfEmpty(Mono.defer(() -> {
                    // Create new User record with initial scores from Python logic [cite: 1, 7, 14, 15]
                    User newUser = new User(
                            UUID.randomUUID(),
                            normalizedUsername,
                            email,
                            passwordEncoder.encode(password), // Replaces get_password_hash [cite: 11]
                            null, // walletAddress
                            role,
                            0.0,  // trustScore [cite: 14]
                            0L,   // ratingsCount [cite: 15]
                            0.0,  // totalWeightedScore [cite: 16]
                            0.0,  // totalWeightSum [cite: 17]
                            UUID.randomUUID().toString() // secretSalt [cite: 18]
                    );
                    return userRepository.save(newUser);
                }));
    }

    /**
     * Replaces Python email login logic.
     */
    public Mono<Map<String, String>> login(String email, String password) {
        return userRepository.findByEmail(email)
                .filter(user -> passwordEncoder.matches(password, user.hashedPassword()))
                .map(user -> generateAuthResponse(user))
                .switchIfEmpty(Mono.error(new RuntimeException("Invalid credentials")));
    }

    /**
     * Replaces Python wallet_login logic.
     * Automatically registers new users on first wallet login if username is provided.
     */
    public Mono<Map<String, String>> walletLogin(String walletAddress, String username, String role) {
        return userRepository.findByWalletAddress(walletAddress)
                .map(user -> generateAuthResponse(user))
                .switchIfEmpty(Mono.defer(() -> {
                    if (username == null) {
                        return Mono.error(new RuntimeException("Username required for new wallet registration"));
                    }
                    
                    String normalizedUsername = username.toLowerCase();
                    return userRepository.findByUsername(normalizedUsername)
                            .flatMap(exists -> Mono.<Map<String, String>>error(new RuntimeException("Username already claimed")))
                            .switchIfEmpty(registerWalletUser(walletAddress, normalizedUsername, role));
                }));
    }

    /**
     * Helper for new wallet-based registrations.
     */
    private Mono<Map<String, String>> registerWalletUser(String walletAddress, String username, String role) {
        User newUser = new User(
                UUID.randomUUID(),
                username,
                null, // email
                null, // hashedPassword
                walletAddress, // [cite: 12]
                role,
                0.0,
                0L,
                0.0,
                0.0,
                UUID.randomUUID().toString()
        );
        return userRepository.save(newUser).map(this::generateAuthResponse);
    }

    /**
     * Formats the response exactly like the Python identity dictionary logic.
     * Uses JwtService to generate access and refresh tokens[cite: 77, 85].
     */
    private Map<String, String> generateAuthResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user.username()); // 
        String refreshToken = jwtService.generateRefreshToken(user.username()); // 

        String identityType = user.email() != null ? "email" : "wallet";
        String identity = user.email() != null ? user.email() : user.walletAddress();

        return Map.of(
                "accessToken", accessToken,
                "refreshToken", refreshToken,
                "userId", user.id().toString(),
                "username", user.username(),
                "role", user.role(),
                "identityType", identityType,
                "identity", identity,
                "trust_score", String.valueOf(user.trustScore()), // [cite: 14]
                "ratings_count", String.valueOf(user.ratingsCount()) // [cite: 15]
        );
    }
}