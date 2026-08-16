package com.futurelock.vault.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final boolean mailEnabled;
    private final String fromAddress;

    public EmailService(
            JavaMailSender mailSender,
            @Value("${app.mail.enabled:false}") boolean mailEnabled,
            @Value("${spring.mail.username:}") String fromAddress) {
        this.mailSender = mailSender;
        this.mailEnabled = mailEnabled;
        this.fromAddress = fromAddress;
    }

    public Mono<Void> sendVerificationEmail(String to, String code) {
        if (!mailEnabled) {
            // Local development only. Never expose the code through the HTTP response.
            log.warn("MAIL_ENABLED=false. FutureLock verification code for {} is {}", to, code);
            return Mono.empty();
        }

        return Mono.fromRunnable(() -> {
                    SimpleMailMessage message = new SimpleMailMessage();
                    if (fromAddress != null && !fromAddress.isBlank()) {
                        message.setFrom(fromAddress);
                    }
                    message.setTo(to);
                    message.setSubject("FutureLock verification code");
                    message.setText(
                            "Your FutureLock verification code is " + code
                                    + ". It expires in 2 minutes.");
                    mailSender.send(message);
                })
                .subscribeOn(Schedulers.boundedElastic())
                .then();
    }
}
