package com.futurelock.vault.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.OffsetDateTime;

@Table("email_verifications")
public record EmailVerification(
        @Id @Column("email") String email,
        @Column("code_hash") String codeHash,
        @Column("expires_at") OffsetDateTime expiresAt,
        @Column("request_count") Integer requestCount,
        @Column("window_started_at") OffsetDateTime windowStartedAt,
        @Column("verified") Boolean verified,
        @Column("created_at") OffsetDateTime createdAt,
        @Version @Column("version") Long version
) {}
