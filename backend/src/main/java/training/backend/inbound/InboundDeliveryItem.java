package training.backend.inbound;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import training.backend.product.Product;


@Entity
@Table(
        name = "inbound_delivery_item",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_inbound_delivery_item_product",
                columnNames = {"inbound_delivery_id", "product_id"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class InboundDeliveryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "inbound_delivery_id")
    private InboundDelivery inboundDelivery;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id")
    private Product product;

    private int quantity;

    InboundDeliveryItem(InboundDelivery inboundDelivery, Product product, int quantity) {
        requirePositive(quantity);
        this.inboundDelivery = inboundDelivery;
        this.product = product;
        this.quantity = quantity;
    }

    void increaseQuantity(int amount) {
        requirePositive(amount);
        this.quantity = Math.addExact(this.quantity, amount); // fails loudly instead of overflowing
    }

    private static void requirePositive(int value) {
        if(value <= 0) {
            throw new IllegalArgumentException("Item quantity must be positive, was " + value);
        }
    }
}
