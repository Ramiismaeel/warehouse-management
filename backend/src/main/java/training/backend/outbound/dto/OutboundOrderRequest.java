package training.backend.outbound.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

/** Create/update a Warenausgang draft. orderDate defaults to today; duplicate products are merged. */
public record OutboundOrderRequest(
        @NotNull(message = "Kunde ist erforderlich")
        Long customerId,

        LocalDate orderDate,

        @Size(max = 255, message = "Notiz darf höchstens 255 Zeichen lang sein")
        String note,

        @NotEmpty(message = "Mindestens eine Position ist erforderlich")
        List<@NotNull(message = "Position darf nicht leer sein") @Valid OutboundOrderItemRequest> items
) {
}
