package com.futurelock.vault.repository;

import com.futurelock.vault.model.*;
import org.junit.jupiter.api.Test;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.lang.reflect.RecordComponent;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.*;

class PersistenceMappingContractTest {
    @Test
    void persistedModels_shouldUseExpectedTablesAndSnakeCaseColumns() {
        assertEquals("users", User.class.getAnnotation(Table.class).value());
        assertColumn(User.class, "hashedPassword", "hashed_password");
        assertColumn(User.class, "walletAddress", "wallet_address");
        assertColumn(User.class, "trustScore", "trust_score");
        assertColumn(User.class, "ratingsCount", "ratings_count");
        assertColumn(User.class, "totalWeightedScore", "total_weighted_score");
        assertColumn(User.class, "totalWeightSum", "total_weight_sum");
        assertColumn(User.class, "secretSalt", "secret_salt");
        assertEquals("intel_metadata", IntelMetadata.class.getAnnotation(Table.class).value());
        assertColumn(IntelMetadata.class, "priceETH", "price_eth");
        assertColumn(PurchaseHistory.class, "transactionHash", "transaction_hash");
        assertColumn(Rating.class, "isDispute", "is_dispute");
    }

    @Test
    void schema_shouldContainEveryVersionedTableAndVerificationStorage() throws Exception {
        try (var stream = getClass().getClassLoader().getResourceAsStream("db/migration/V1__initial_schema.sql")) {
            assertNotNull(stream);
            String sql = new String(stream.readAllBytes(), StandardCharsets.UTF_8);
            assertTrue(sql.contains("CREATE TABLE IF NOT EXISTS email_verifications"));
            assertTrue(sql.contains("code_hash VARCHAR(64) NOT NULL"));
            assertTrue(sql.contains("ALTER TABLE users ADD COLUMN IF NOT EXISTS version"));
            assertTrue(sql.contains("ALTER TABLE purchase_history ADD COLUMN IF NOT EXISTS version"));
            assertTrue(sql.contains("ALTER TABLE ratings ADD COLUMN IF NOT EXISTS version"));
        }
    }

    private void assertColumn(Class<?> type, String componentName, String expected) {
        try {
            Column column = type.getDeclaredField(componentName).getAnnotation(Column.class);
            assertNotNull(column, "Missing @Column on " + componentName);
            assertEquals(expected, column.value());
        } catch (NoSuchFieldException exception) {
            fail("Missing record component: " + componentName);
        }
    }
}
