package training.backend.exceptions;

import training.backend.entities.DocumentStatus;

/**
 * 409: an action is not allowed in the document's current status (e.g. editing a confirmed Beleg).
 *
 * <pre>throw new InvalidStatusTransitionException("Bestätigen", delivery.getStatus());</pre>
 * → "„Bestätigen“ ist im Status „Storniert“ nicht möglich."
 */
public class InvalidStatusTransitionException extends RuntimeException {

    public InvalidStatusTransitionException(String action, DocumentStatus status) {
        super("„%s“ ist im Status „%s“ nicht möglich.".formatted(action, label(status)));
    }

    private static String label(DocumentStatus status) {
        return switch (status) {
            case DRAFT -> "Entwurf";
            case CONFIRMED -> "Bestätigt";
            case CANCELLED -> "Storniert";
        };
    }
}