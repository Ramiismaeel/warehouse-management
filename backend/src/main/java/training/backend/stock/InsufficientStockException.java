package training.backend.stock;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Thrown when an OUT movement would make at least one product's quantity negative.
 * Carries ALL shortages, so the user sees every problem at once.
 */
public class InsufficientStockException extends RuntimeException {

    private final List<Shortage> shortages;

    public InsufficientStockException(List<Shortage> shortages) {
        super(buildMessage(shortages));
        this.shortages = List.copyOf(shortages);
    }

    public List<Shortage> getShortages() {
        return shortages;
    }

    private static String buildMessage(List<Shortage> shortages) {
        return "Nicht genügend Bestand: " + shortages.stream()
                .map(s -> "%s (benötigt %d, verfügbar %d)"
                        .formatted(s.productName(), s.requested(), s.available()))
                .collect(Collectors.joining(", "));
    }
}