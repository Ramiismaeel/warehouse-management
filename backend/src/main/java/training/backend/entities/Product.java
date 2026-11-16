package training.backend.entities;


import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "product")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Product extends BaseEntity {

    @Column(unique = true)
    private String sku;
    private String name;
    private String description;

    @Enumerated(EnumType.STRING)
    private ProductUnit unit;

    @Setter(AccessLevel.NONE)
    private int quantity;
    private int minQuantity;
    private String imageUrl;

    @Setter(AccessLevel.NONE)
    @Version
    private Long version;

    public void changeQuantity(int delta) {
        int newQuantity = this.quantity+ delta;

        if(newQuantity < 0) {
            throw new IllegalStateException(
                    "Stock of product " + sku + " would become negative (" + newQuantity + ")");
        }
        this.quantity = newQuantity;
    }

    public boolean isLowStock() {
        return quantity<= minQuantity;
    }

    public boolean isOutOfStock() {
        return quantity ==0;
    }

}
