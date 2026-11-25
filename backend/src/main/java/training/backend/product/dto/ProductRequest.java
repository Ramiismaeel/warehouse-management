package training.backend.product.dto;


import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.URL;
import training.backend.product.ProductUnit;


public record ProductRequest(
        @NotBlank(message = "SKU ist erforderlich")
        @Size(min = 2, max = 50, message = "SKU muss zwischen 2 und 50 Zeichen lang sein")
        String sku,

        @NotBlank(message = "Name ist erforderlich")
        @Size(min = 3, max = 255, message = "Name muss zwischen 3 und 255 Zeichen lang sein")
        String name,

        @Size(max = 255, message = "Beschreibung darf höchstens 255 Zeichen lang sein")
        String description,

        @NotNull(message = "Einheit ist erforderlich")
        ProductUnit unit,

        @NotNull(message = "Mindestbestand ist erforderlich")
        @PositiveOrZero(message = "Mindestbestand darf nicht negativ sein")
        @Max(value = 1_000_000, message = "Mindestbestand darf höchstens 1.000.000 sein")
        Integer minQuantity,

        @Size(max = 500, message = "Bild-URL darf höchstens 500 Zeichen lang sein")
        @URL(message = "Bitte eine gültige URL eingeben")
        String imageUrl
) {
}
