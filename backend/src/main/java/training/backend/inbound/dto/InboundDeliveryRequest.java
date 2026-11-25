package training.backend.inbound.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

/** Create/update a Wareneingang draft. deliveryDate defaults to today; duplicate products are merged. */
public record InboundDeliveryRequest(
        @NotBlank(message = "Lieferant ist erforderlich")
        @Size(max = 255, message = "Lieferant darf höchstens 255 Zeichen lang sein")
        String supplierName,


        LocalDate deliveryDate,

        @Size(max = 255, message = "Notiz darf höchstens 255 Zeichen lang sein")
        String note,

        @NotEmpty(message = "Mindestens eine Position ist erforderlich")
        List<@NotNull(message = "Position darf nicht leer sein") @Valid InboundDeliveryItemRequest> items
) {
}
