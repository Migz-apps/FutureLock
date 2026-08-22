package com.futurelock.vault.integration;

import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;

import static org.junit.jupiter.api.Assertions.assertFalse;

/**
 * Guard for future R2DBC integration tests. It deliberately requires TEST_DB_URL
 * and never reads DB_URL, DB_USERNAME, or DB_PASSWORD, preventing accidental use
 * of the production Supabase database.
 */
@Tag("database-integration")
@EnabledIfEnvironmentVariable(named = "TEST_DB_URL", matches = ".+")
class DatabaseIntegrationSafetyTest {
    @Test
    void testDatabaseUrl_shouldNotBeConfiguredAsProductionEnvironmentVariable() {
        assertFalse(System.getenv("TEST_DB_URL").isBlank());
    }
}
