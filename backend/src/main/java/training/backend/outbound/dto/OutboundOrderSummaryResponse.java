package training.backend.outbound.dto;

import training.backend.document.DocumentStatus;

import java.time.LocalDate;

public record OutboundOrderSummaryResponse(
        Long id,
        String number,
        String customerName,
        LocalDate orderDate,
        DocumentStatus status,
        int itemCount,
        int totalQuantity
) {
}
