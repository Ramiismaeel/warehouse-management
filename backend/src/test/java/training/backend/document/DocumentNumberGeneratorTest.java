package training.backend.document;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class DocumentNumberGeneratorTest {

    @Test
    void padsIdToFourDigits() {
        assertEquals("WE-2026-0007", DocumentNumberGenerator.format("WE", 2026, 7L));
    }

    @Test
    void doesNotTruncateLargeIds() {
        assertEquals("WA-2026-12345", DocumentNumberGenerator.format("WA", 2026, 12345L));
    }
}