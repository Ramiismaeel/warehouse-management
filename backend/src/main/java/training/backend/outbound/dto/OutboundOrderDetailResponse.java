package training.backend.outbound.dto;

import training.backend.customer.dto.CustomerResponse;
import training.backend.document.DocumentStatus;

import java.time.LocalDate;
import java.util.List;

public record OutboundOrderDetailResponse(
        Long id,
        String number,
        String customerName,
        LocalDate orderDate,
        DocumentStatus status,
        int itemCount,
        int totalQuantity,
        String note,
        CustomerResponse customer,
        List<OutboundOrderItemResponse> items
) {
}
