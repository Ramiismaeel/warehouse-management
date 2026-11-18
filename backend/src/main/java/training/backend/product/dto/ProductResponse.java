package training.backend.product.dto;

import training.backend.product.ProductUnit;

import java.time.Instant;

public record ProductResponse(
        Long id,
        String sku,
        String name,
        String description,
        ProductUnit unit,
        Integer quantity,
        Integer minQuantity,
        String imageUrl,
        boolean lowStock,
        boolean outOfStock,
        Long version,
        Instant createdAt,
        Instant updatedAt
                              ) {
}
