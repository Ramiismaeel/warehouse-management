package training.backend.inbound.dto;

import training.backend.document.DocumentStatus;

import java.time.Instant;

public record SummaryResponse(
        Long id,
        String number,
        String supplierName,
        Instant deliveryDate,
        DocumentStatus status,
        int itemsCount,
        int totalQuantity
) {
}
