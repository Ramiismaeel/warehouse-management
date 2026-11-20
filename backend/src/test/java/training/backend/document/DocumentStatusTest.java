package training.backend.document;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class DocumentStatusTest {

    @Test
    void draftCanBeEditedAndConfirmedButNotCancelled() {
        assertTrue(DocumentStatus.DRAFT.canEdit());
        assertTrue(DocumentStatus.DRAFT.canConfirm());
        assertFalse(DocumentStatus.DRAFT.canCancel());
    }

    @Test
    void confirmedCanOnlyBeCancelled() {
        assertFalse(DocumentStatus.CONFIRMED.canEdit());
        assertFalse(DocumentStatus.CONFIRMED.canConfirm());
        assertTrue(DocumentStatus.CONFIRMED.canCancel());
    }

    @Test
    void cancelledAllowsNothing() {
        assertFalse(DocumentStatus.CANCELLED.canEdit());
        assertFalse(DocumentStatus.CANCELLED.canConfirm());
        assertFalse(DocumentStatus.CANCELLED.canCancel());
    }
}