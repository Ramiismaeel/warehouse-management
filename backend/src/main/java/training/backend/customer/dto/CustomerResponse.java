package training.backend.customer.dto;

import java.time.Instant;

public record CustomerResponse(
        Long id,
        String name,
        String email,
        String phone,
        String street,
        String zipCode,
        String city,
        Instant createdAt,
        Instant updatedAt
) {
}
