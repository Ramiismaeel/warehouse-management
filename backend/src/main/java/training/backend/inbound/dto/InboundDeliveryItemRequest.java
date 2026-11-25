package training.backend.inbound.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record InboundDeliveryItemRequest(
        @NotNull(message = "Artikel ist erforderlich")
        Long productId,

        @NotNull(message = "Menge ist erforderlich")
        @Positive(message = "Menge muss mindestens 1 sein")
        @Max(value = 1_000_000, message = "Menge darf höchstens 1.000.000 sein")
        Integer quantity
) {
}
