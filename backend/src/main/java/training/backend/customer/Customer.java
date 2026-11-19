package training.backend.customer;

import jakarta.persistence.*;
import lombok.*;
import training.backend.entities.BaseEntity;


@Entity
@Table(name = "customer")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Customer extends BaseEntity {

    @Column(nullable = false)
    private String name;
    private String email;
    private String phone;
    private String street;
    private String zipCode;
    private String city;
}
