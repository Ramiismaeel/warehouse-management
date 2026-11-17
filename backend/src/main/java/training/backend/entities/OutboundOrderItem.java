package training.backend.entities;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;


@Entity
@Table(
        name = "outbound_order_item",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_outbound_order_item_product",
                columnNames = {"outbound_order_id", "product_id"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class OutboundOrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int quantity;


    @JoinColumn(name = "product_id", nullable = false)
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Product product;

    @JoinColumn(name = "outbound_order_id", nullable = false)
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private OutboundOrder outboundOrder;


    OutboundOrderItem(OutboundOrder outboundOrder, Product product, int quantity) {
        requirePositive(quantity);
        this.outboundOrder = outboundOrder;
        this.product = product;
        this.quantity = quantity;
    }

    void increaseQuantity(int amount) {
        requirePositive(amount);
        this.quantity += amount;
    }

    private static void requirePositive(int value) {
        if(value <= 0) {
            throw new IllegalArgumentException("Item quantity must be positive, was " + value);
        }
    }

}
