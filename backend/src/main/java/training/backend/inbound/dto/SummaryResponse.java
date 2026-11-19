package training.backend.inbound.dto;

import training.backend.document.DocumentStatus;


import java.time.LocalDate;

public record SummaryResponse(
        Long id,
        String number,
        String supplierName,
        LocalDate deliveryDate,
        DocumentStatus status,
        int itemsCount,
        int totalQuantity
) {
}
