package training.backend.exceptions;

import lombok.Getter;

import java.util.List;

/**
 * 409: a stock decrease would make one or more products negative (business rule 3).
 * Thrown by StockService with EVERY shortage, so the user sees all problems at once.
 */
@Getter
public class InsufficientStockException extends RuntimeException {

    /** One product that lacks stock. Serialized into the "shortages" list of the response. */
    public record Shortage(Long productId, String sku, String name, int requested, int available) {
    }

    private final List<Shortage> shortages;

    public InsufficientStockException(List<Shortage> shortages) {
        super(buildMessage(shortages));
        this.shortages = List.copyOf(shortages);
    }

    private static String buildMessage(List<Shortage> shortages) {
        if (shortages.size() == 1) {
            Shortage s = shortages.getFirst();
            return "Nicht genügend Bestand für „%s“: benötigt %d, verfügbar %d."
                    .formatted(s.name(), s.requested(), s.available());
        }
        return "Nicht genügend Bestand für %d Artikel.".formatted(shortages.size());
    }
}