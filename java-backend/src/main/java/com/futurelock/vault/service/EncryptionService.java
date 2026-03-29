package com.futurelock.vault.service;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;
import java.util.concurrent.ExecutorService;

@Service
public class EncryptionService {

    private final ExecutorService virtualThreadExecutor;

    public EncryptionService(@Qualifier("virtualThreadExecutor") ExecutorService virtualThreadExecutor) {
        this.virtualThreadExecutor = virtualThreadExecutor;
    }

    /**
     * Decrypts AES-256-GCM encrypted payload on a Virtual Thread, avoiding Event Loop blocking.
     */
    public Mono<String> decrypt(String blob, String key) {
        return Mono.fromCallable(() -> {
            byte[] decodedKey = Base64.getDecoder().decode(key);
            SecretKeySpec secretKey = new SecretKeySpec(decodedKey, 0, decodedKey.length, "AES");

            byte[] decodedBlob = Base64.getDecoder().decode(blob);
            
            // Extract IV (first 12 bytes) and Ciphertext
            byte[] iv = new byte[12];
            System.arraycopy(decodedBlob, 0, iv, 0, 12);
            GCMParameterSpec gcmSpec = new GCMParameterSpec(128, iv);

            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, secretKey, gcmSpec);

            byte[] encryptedData = new byte[decodedBlob.length - 12];
            System.arraycopy(decodedBlob, 12, encryptedData, 0, encryptedData.length);

            byte[] decryptedData = cipher.doFinal(encryptedData);
            return new String(decryptedData);
        }).subscribeOn(reactor.core.scheduler.Schedulers.fromExecutor(virtualThreadExecutor));
    }
}
