package training.backend;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Checks the prod schema path without Neon: Flyway runs db/migration and Hibernate validates every entity
 * against the result (ddl-auto=validate). If an entity and V1__init.sql drift apart, the context fails to start.
 * Runs on H2 in PostgreSQL mode, see src/test/resources/application-flyway-validate.properties.
 */
@SpringBootTest
@ActiveProfiles("flyway-validate")
class FlywaySchemaValidationTest {

    @Autowired
    private Flyway flyway;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void migrationsApply_andEntitiesMatchTheSchema() {
        assertThat(flyway.info().applied()).isNotEmpty();
        assertThat(flyway.info().pending()).isEmpty();
    }

    @Test
    void noSeedDataIsLoaded() {
        assertThat(jdbcTemplate.queryForObject("SELECT COUNT(*) FROM product", Integer.class)).isZero();
        assertThat(jdbcTemplate.queryForObject("SELECT COUNT(*) FROM customer", Integer.class)).isZero();
    }
}
