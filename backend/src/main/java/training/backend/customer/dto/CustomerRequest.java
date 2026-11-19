package training.backend.customer.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CustomerRequest(
        @NotBlank(message = "Name ist erforderlich")
        @Size(max = 255, message = "Name darf höchstens 255 Zeichen lang sein")
        String name,

        @Email(message = "Bitte eine gültige E-Mail-Adresse eingeben")
        @Size(max = 255, message = "E-Mail darf höchstens 255 Zeichen lang sein")
        String email,

        @Size(max = 50, message = "Telefon darf höchstens 50 Zeichen lang sein")
        String phone,

        @Size(max = 255, message = "Straße darf höchstens 255 Zeichen lang sein")
        String street,

        @Pattern(regexp = "^(\\d{5})?$", message = "PLZ muss aus 5 Ziffern bestehen")
        String zipCode,

        @Size(max = 255, message = "Ort darf höchstens 255 Zeichen lang sein")
        String city
) {
}
