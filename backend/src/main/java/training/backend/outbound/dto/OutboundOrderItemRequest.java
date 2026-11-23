package training.backend.outbound.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record OutboundOrderItemRequest(
        @NotNull(message = "Artikel ist erforderlich")
        Long productId,

        @NotNull(message = "Menge ist erforderlich")
        @Positive(message = "Menge muss mindestens 1 sein")
        Integer quantity
) {
}
