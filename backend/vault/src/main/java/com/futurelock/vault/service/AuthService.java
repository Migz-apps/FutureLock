package com.futurelock.vault.service;

import com.futurelock.vault.model.User;
import com.futurelock.vault.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public Mono<User> signup(String username, String email, String password, String role) {
        String normalizedUsername = normalizeUsername(username);
        String normalizedEmail = normalizeEmail(email);

        if (normalizedUsername.isBlank()) {
            return Mono.error(new IllegalArgumentException("Username is required."));
        }
        if (normalizedEmail.isBlank()) {
            return Mono.error(new IllegalArgumentException("Email is required."));
        }
        if (password == null || password.length() < 8) {
            return Mono.error(new IllegalArgumentException(
                    "Password must be at least 8 characters long."));
        }

        String normalizedRole = normalizeRole(role);

        return userRepository.findByUsername(normalizedUsername)
                .flatMap(existing -> Mono.<User>error(
                        new IllegalStateException("Username already claimed.")))
                .switchIfEmpty(
                        userRepository.findByEmail(normalizedEmail)
                                .flatMap(existing -> Mono.<User>error(
                                        new IllegalStateException("Email already registered.")))
                                .switchIfEmpty(Mono.defer(() -> {
                                    User newUser = new User(
                                            UUID.randomUUID(),
                                            normalizedUsername,
                                            normalizedEmail,
                                            passwordEncoder.encode(password),
                                            null,
                                            normalizedRole,
                                            0.0,
                                            0L,
                                            0.0,
                                            0.0,
                                            UUID.randomUUID().toString());

                                    return userRepository.save(newUser);
                                })));
    }

    public Mono<User> authenticateEmail(String email, String password) {
        String normalizedEmail = normalizeEmail(email);

        return userRepository.findByEmail(normalizedEmail)
                .filter(user -> user.hashedPassword() != null
                        && password != null
                        && passwordEncoder.matches(password, user.hashedPassword()))
                .switchIfEmpty(Mono.error(
                        new IllegalArgumentException("Incorrect email or password.")));
    }

    public Mono<User> walletLogin(String walletAddress, String username, String role) {
        if (walletAddress == null || walletAddress.isBlank()) {
            return Mono.error(new IllegalArgumentException("Wallet address is required."));
        }

        String normalizedWallet = walletAddress.trim().toLowerCase();

        return userRepository.findByWalletAddress(normalizedWallet)
                .switchIfEmpty(Mono.defer(() -> {
                    String normalizedUsername = normalizeUsername(username);

                    if (normalizedUsername.isBlank()) {
                        return Mono.error(new IllegalArgumentException(
                                "Username is required for a new wallet account."));
                    }

                    return userRepository.findByUsername(normalizedUsername)
                            .flatMap(existing -> Mono.<User>error(
                                    new IllegalStateException("Username already claimed.")))
                            .switchIfEmpty(Mono.defer(() -> {
                                User newUser = new User(
                                        UUID.randomUUID(),
                                        normalizedUsername,
                                        null,
                                        null,
                                        normalizedWallet,
                                        normalizeRole(role),
                                        0.0,
                                        0L,
                                        0.0,
                                        0.0,
                                        UUID.randomUUID().toString());

                                return userRepository.save(newUser);
                            }));
                }));
    }

    private String normalizeUsername(String username) {
        return username == null ? "" : username.trim().toLowerCase();
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    private String normalizeRole(String role) {
        return "Creator".equalsIgnoreCase(role) ? "Creator" : "Buyer";
    }
}
