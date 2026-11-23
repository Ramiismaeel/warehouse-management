package training.backend.outbound.dto;

import training.backend.product.ProductUnit;

public record OutboundOrderItemResponse(
        Long productId,
        String sku,
        String name,
        int quantity,
        ProductUnit unit
) {
}
