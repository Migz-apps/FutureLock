package com.futurelock.vault.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;

    public Mono<Void> sendVerificationEmail(String to, String code) {
        return Mono.fromRunnable(() -> {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("FutureLock Verification Code");
            message.setText("Your verification code is: " + code + ". This code expires in 2 minutes.");
            mailSender.send(message);
        });
    }
}