package training.backend.product;


import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import training.backend.entities.BaseEntity;

@Entity
@Table(name = "product")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Product extends BaseEntity {

    @Column(unique = true, nullable = false, length = 50)
    private String sku;
    private String name;
    private String description;

    @Enumerated(EnumType.STRING)
    private ProductUnit unit;

    @Setter(AccessLevel.NONE)
    private int quantity = 0;
    private int minQuantity;
    @Column(length = 500)
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
