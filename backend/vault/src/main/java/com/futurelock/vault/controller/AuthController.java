package com.futurelock.vault.controller;

import com.futurelock.vault.model.User;
import com.futurelock.vault.repository.UserRepository;
import com.futurelock.vault.service.JwtService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;
import com.futurelock.vault.dto.AuthResponse;
import com.futurelock.vault.dto.LoginRequest;
import com.futurelock.vault.dto.SignupRequest;
import com.futurelock.vault.dto.WalletLoginRequest;
import com.futurelock.vault.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import com.futurelock.vault.service.EmailVerificationService;
import com.futurelock.vault.service.RateLimiterService;
import com.futurelock.vault.service.EmailService;
import com.futurelock.vault.dto.EmailVerifyRequest;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.Duration;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Autowired
    private EmailVerificationService emailVerificationService;

    @Autowired
    private RateLimiterService rateLimiterService;

    @Autowired
    private EmailService emailService;

    public AuthController(UserRepository userRepository, JwtService jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    private HttpHeaders setCookies(String access, String refresh) {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.SET_COOKIE, ResponseCookie.from("access_token", access)
                .httpOnly(true).maxAge(Duration.ofMinutes(15)).path("/").sameSite("Lax").build().toString());
        headers.add(HttpHeaders.SET_COOKIE, ResponseCookie.from("refresh_token", refresh)
                .httpOnly(true).maxAge(Duration.ofDays(7)).path("/").sameSite("Lax").build().toString());
        return headers;
    }

    @PostMapping("/signup")
    public Mono<ResponseEntity<Map<String, String>>> signup(@RequestBody SignupData data) {
        return userRepository.findByUsername(data.username().toLowerCase())
                .flatMap(u -> Mono.<ResponseEntity<Map<String, String>>>error(new RuntimeException("Username claimed")))
                .switchIfEmpty(userRepository.findByEmail(data.email())
                        .flatMap(u -> Mono.<ResponseEntity<Map<String, String>>>error(new RuntimeException("Email registered")))
                        .switchIfEmpty(Mono.defer(() -> {
                            User newUser = new User(UUID.randomUUID(), data.username().toLowerCase(), data.email(),
                                    passwordEncoder.encode(data.password()), null, data.role(), 0.0, 0L, 0.0, 0.0, UUID.randomUUID().toString());
                            return userRepository.save(newUser).map(saved -> {
                                String access = jwtService.generateAccessToken(saved.email());
                                String refresh = jwtService.generateRefreshToken(saved.email());
                                return ResponseEntity.ok().headers(setCookies(access, refresh))
                                        .body(Map.of("message", "Signup successful", "role", saved.role(), "identityType", "email", "identity", saved.email()));
                            });
                        }))
                );
    }

    @PostMapping("/login")
    public Mono<ResponseEntity<Map<String, String>>> login(@RequestBody LoginData data) {
        return userRepository.findByEmail(data.email())
                .filter(u -> u.hashedPassword() != null && passwordEncoder.matches(data.password(), u.hashedPassword()))
                .map(user -> {
                    String access = jwtService.generateAccessToken(user.email());
                    String refresh = jwtService.generateRefreshToken(user.email());
                    return ResponseEntity.ok().headers(setCookies(access, refresh))
                            .body(Map.of("message", "Login successful", "role", user.role(), "identityType", "email", "identity", user.email()));
                })
                .switchIfEmpty(Mono.error(new RuntimeException("Incorrect email or password")));
    }

    @PostMapping("/wallet-login")
    public Mono<ResponseEntity<Map<String, String>>> walletLogin(@RequestBody WalletLoginData data) {
        return userRepository.findByWalletAddress(data.walletAddress())
                .switchIfEmpty(Mono.defer(() -> {
                    if (data.username() == null) return Mono.error(new RuntimeException("Username required"));
                    return userRepository.findByUsername(data.username().toLowerCase())
                            .flatMap(u -> Mono.<User>error(new RuntimeException("Username claimed")))
                            .switchIfEmpty(Mono.defer(() -> {
                                User newUser = new User(UUID.randomUUID(), data.username().toLowerCase(), null, null,
                                        data.walletAddress(), data.role(), 0.0, 0L, 0.0, 0.0, UUID.randomUUID().toString());
                                return userRepository.save(newUser);
                            }));
                }))
                .map(user -> {
                    String access = jwtService.generateAccessToken(user.walletAddress());
                    String refresh = jwtService.generateRefreshToken(user.walletAddress());
                    return ResponseEntity.ok().headers(setCookies(access, refresh))
                            .body(Map.of("message", "Wallet login successful", "role", user.role(), "identityType", "wallet", "identity", user.walletAddress()));
                });
    }

    @PostMapping("/refresh")
    public Mono<ResponseEntity<Map<String, String>>> refresh(@CookieValue(value = "refresh_token", defaultValue = "") String refreshToken) {
        if (refreshToken.isEmpty() || !jwtService.isRefreshToken(refreshToken)) {
            return Mono.error(new RuntimeException("Invalid refresh token"));
        }
        
        String subject = jwtService.extractSubject(refreshToken);
        
        return userRepository.findByEmail(subject)
                .switchIfEmpty(userRepository.findByWalletAddress(subject))
                .map(user -> {
                    String identifier = user.email() != null ? user.email() : user.walletAddress();
                    String access = jwtService.generateAccessToken(identifier);
                    HttpHeaders headers = new HttpHeaders();
                    headers.add(HttpHeaders.SET_COOKIE, ResponseCookie.from("access_token", access)
                            .httpOnly(true).maxAge(Duration.ofMinutes(15)).path("/").sameSite("Lax").build().toString());
                    return ResponseEntity.ok().headers(headers).body(Map.of("message", "Token refreshed"));
                })
                .switchIfEmpty(Mono.error(new RuntimeException("User not found")));
    }

    @GetMapping("/me")
    public Mono<ResponseEntity<Map<String, Object>>> me(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null || jwt.getSubject() == null) {
            return Mono.error(new RuntimeException("Not authenticated"));
        }
        
        String subject = jwt.getSubject();
        return userRepository.findByEmail(subject)
                .switchIfEmpty(userRepository.findByWalletAddress(subject))
                .map(user -> {
                    String identityType = user.email() != null ? "email" : "wallet";
                    String identity = user.email() != null ? user.email() : user.walletAddress();
                    return ResponseEntity.ok().body(Map.<String, Object>of(
                            "id", user.id(),
                            "username", user.username(),
                            "role", user.role(),
                            "identityType", identityType,
                            "identity", identity,
                            "trust_score", user.trustScore(),
                            "ratings_count", user.ratingsCount()
                    ));
                })
                .switchIfEmpty(Mono.error(new RuntimeException("User not found")));
    }

    @PostMapping("/logout")
    public Mono<ResponseEntity<Map<String, String>>> logout() {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.SET_COOKIE, ResponseCookie.from("access_token", "").maxAge(0).path("/").build().toString());
        headers.add(HttpHeaders.SET_COOKIE, ResponseCookie.from("refresh_token", "").maxAge(0).path("/").build().toString());
        return Mono.just(ResponseEntity.ok().headers(headers).body(Map.of("message", "Logged out successfully")));
    }

    @PostMapping("/verify-email")
    public Mono<ResponseEntity<String>> requestVerification(@RequestBody Map<String, String> request) {
        String email = request.get("email");
    
        return emailVerificationService.verifyAndGenerateCode(email)
            .flatMap(code -> rateLimiterService.checkLimitAndStore(email, code)
                .then(emailService.sendVerificationEmail(email, code)) // We'll define this next
                .thenReturn(ResponseEntity.ok("Verification code sent")))
            .onErrorResume(e -> Mono.just(ResponseEntity.badRequest().body(e.getMessage())));
    }

    @PostMapping("/confirm-code")
    public Mono<ResponseEntity<Boolean>> confirmCode(@RequestBody EmailVerifyRequest request) {
        return rateLimiterService.validateCode(request.email(), request.code())
            .map(isValid -> ResponseEntity.ok(isValid))
            .onErrorResume(e -> Mono.just(ResponseEntity.status(401).body(false)));
    }
}

record SignupData(String username, String email, String password, String role) {}
record LoginData(String email, String password) {}
record WalletLoginData(String username, String walletAddress, String role) {}
