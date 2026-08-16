package com.futurelock.vault.service;

import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import javax.naming.directory.Attributes;
import javax.naming.directory.DirContext;
import javax.naming.directory.InitialDirContext;
import java.security.SecureRandom;
import java.util.Hashtable;
import java.util.regex.Pattern;

@Service
public class EmailVerificationService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,63}$",
            Pattern.CASE_INSENSITIVE);

    private final SecureRandom secureRandom = new SecureRandom();

    public Mono<String> verifyAndGenerateCode(String rawEmail) {
        if (rawEmail == null) {
            return Mono.error(new IllegalArgumentException("Email is required."));
        }

        String email = rawEmail.trim().toLowerCase();

        if (!EMAIL_PATTERN.matcher(email).matches()) {
            return Mono.error(new IllegalArgumentException("Invalid email address."));
        }

        return verifyDomainHasMxRecord(email)
                .thenReturn(generateSecureCode());
    }

    private Mono<Void> verifyDomainHasMxRecord(String email) {
        return Mono.fromCallable(() -> {
                    String domain = email.substring(email.indexOf('@') + 1);

                    Hashtable<String, String> env = new Hashtable<>();
                    env.put("java.naming.factory.initial", "com.sun.jndi.dns.DnsContextFactory");

                    DirContext context = null;
                    try {
                        context = new InitialDirContext(env);
                        Attributes attrs = context.getAttributes(domain, new String[]{"MX"});

                        if (attrs.get("MX") == null || attrs.get("MX").size() == 0) {
                            throw new IllegalArgumentException(
                                    "This email domain cannot receive email.");
                        }

                        return true;
                    } finally {
                        if (context != null) {
                            context.close();
                        }
                    }
                })
                .subscribeOn(Schedulers.boundedElastic())
                .then();
    }

    private String generateSecureCode() {
        return String.format("%06d", secureRandom.nextInt(1_000_000));
    }
}
