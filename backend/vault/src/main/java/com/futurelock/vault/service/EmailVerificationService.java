package com.futurelock.vault.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import javax.naming.directory.Attributes;
import javax.naming.directory.DirContext;
import javax.naming.directory.InitialDirContext;
import java.util.Hashtable;
import java.util.Random;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,6}$", Pattern.CASE_INSENSITIVE);

    /**
     * Executes the multi-stage verification.
     * If any stage fails, the Mono terminates with an error.
     */
    public Mono<String> verifyAndGenerateCode(String email) {
        return Mono.just(email)
                .filter(e -> EMAIL_PATTERN.matcher(e).matches())
                .switchIfEmpty(Mono.error(new RuntimeException("Invalid email syntax")))
                .flatMap(this::verifyDomainHasMXRecord)
                .map(e -> generateSecureCode());
    }

    private Mono<String> verifyDomainHasMXRecord(String email) {
        return Mono.fromCallable(() -> {
            String domain = email.substring(email.indexOf("@") + 1);
            Hashtable<String, String> env = new Hashtable<>();
            env.put("java.naming.factory.initial", "com.sun.jndi.dns.DnsContextFactory");
            DirContext ictx = new InitialDirContext(env);
            Attributes attrs = ictx.getAttributes(domain, new String[]{"MX"});
            if (attrs.get("MX") == null) {
                throw new RuntimeException("Domain does not exist or cannot receive emails");
            }
            return email;
        });
    }

    private String generateSecureCode() {
        return String.format("%06d", new Random().nextInt(999999));
    }
}