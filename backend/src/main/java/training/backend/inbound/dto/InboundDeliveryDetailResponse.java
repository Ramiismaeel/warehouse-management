package training.backend.inbound.dto;

import training.backend.document.DocumentStatus;

import java.time.LocalDate;
import java.util.List;

public record InboundDeliveryDetailResponse(
        Long id,
        String number,
        String supplierName,
        LocalDate deliveryDate,
        DocumentStatus status,
        int itemCount,
        int totalQuantity,
        String note,
        List<InboundDeliveryItemResponse> items
) {


}
