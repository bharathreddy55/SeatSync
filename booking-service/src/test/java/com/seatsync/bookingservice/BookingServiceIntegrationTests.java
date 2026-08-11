package com.seatsync.bookingservice;

import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.testcontainers.DockerClientFactory;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import static org.junit.jupiter.api.Assumptions.assumeTrue;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
public class BookingServiceIntegrationTests {

    public static PostgreSQLContainer<?> postgres;

    private static boolean checkDocker() {
        try {
            return DockerClientFactory.instance().isDockerAvailable();
        } catch (Exception e) {
            return false;
        }
    }

    @BeforeAll
    public static void setUpAll() {
        // Skip all tests in this class if Docker is not available
        assumeTrue(checkDocker(), "Docker daemon is not running. Skipping integration tests.");
        
        postgres = new PostgreSQLContainer<>("postgres:15-alpine")
                .withDatabaseName("seatsync_booking_db")
                .withUsername("postgres")
                .withPassword("postgres");
        postgres.start();
    }

    @org.junit.jupiter.api.AfterAll
    public static void tearDownAll() {
        if (postgres != null && postgres.isRunning()) {
            postgres.stop();
        }
    }

    @DynamicPropertySource
    public static void configureProperties(DynamicPropertyRegistry registry) {
        // Only inject container connection strings if Docker is running
        if (checkDocker()) {
            registry.add("spring.datasource.url", () -> postgres.getJdbcUrl());
            registry.add("spring.datasource.username", () -> postgres.getUsername());
            registry.add("spring.datasource.password", () -> postgres.getPassword());
            registry.add("eureka.client.enabled", () -> "false"); // Disable Eureka connection in tests
            registry.add("spring.kafka.listener.auto-startup", () -> "false"); // Disable Kafka listeners in tests
        }
    }

    @Test
    public void contextLoads() {
        // Simple test to verify context boot when postgres is available
        assertTrue(true);
    }
}
