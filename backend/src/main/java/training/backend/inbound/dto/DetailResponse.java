package training.backend.inbound.dto;

import training.backend.document.DocumentStatus;

import java.time.LocalDate;
import java.util.List;

public record DetailResponse(
        Long id,
        String number,
        String supplierName,
        LocalDate deliveryDate,
        DocumentStatus status,
        int itemsCount,
        int totalQuantity,
        String note,
        List<DeliveryItemResponse> items
) {
}
