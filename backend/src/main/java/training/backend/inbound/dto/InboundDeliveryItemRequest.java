package training.backend.inbound.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record InboundDeliveryItemRequest(
        @NotNull
        Long productId,
        @NotNull
        @Positive
        Integer quantity
) {
}
