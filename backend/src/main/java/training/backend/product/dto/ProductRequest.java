package training.backend.product.dto;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.URL;
import training.backend.product.ProductUnit;


public record ProductRequest(
        @NotBlank
        @Size(min = 2, max = 50)
        String sku,

        @NotBlank
        @Size(min = 3, max = 255)
        String name,

        @Size(max = 255)
        String description,

        @NotNull
        ProductUnit unit,

        @NotNull
        @PositiveOrZero
        Integer minQuantity,

        @Size(max = 500)
        @URL
        String imageUrl
) {
}
