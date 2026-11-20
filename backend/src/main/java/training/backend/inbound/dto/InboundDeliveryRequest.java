package training.backend.inbound.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

public record InboundDeliveryRequest(
        @NotBlank
        String supplierName,


        LocalDate deliveryDate,

        @Size(max = 255)
        String note,

        @NotEmpty
        List<@Valid DeliveryItemRequest> items
) {
}
