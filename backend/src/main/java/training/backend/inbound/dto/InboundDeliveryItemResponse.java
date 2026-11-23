package training.backend.inbound.dto;

import training.backend.product.ProductUnit;

public record InboundDeliveryItemResponse(
        Long productId,
        String sku,
        String name,
        int quantity,
        ProductUnit unit
) {
}
