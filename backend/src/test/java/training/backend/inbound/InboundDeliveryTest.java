package training.backend.inbound;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;
import org.springframework.beans.BeanUtils;
import org.springframework.test.util.ReflectionTestUtils;

import training.backend.document.DocumentStatus;
import training.backend.product.Product;

/**
 * Fast unit tests for the entity's own rules (no Spring, no database).
 * If your entity now throws InvalidStatusTransitionException instead of
 * IllegalStateException, change the expected type in the status tests.
 */
class InboundDeliveryTest {

    private InboundDelivery newDraft() {
        return BeanUtils.instantiateClass(InboundDelivery.class); // protected constructor
    }

    private Product product(long id) {
        Product p = BeanUtils.instantiateClass(Product.class);
        ReflectionTestUtils.setField(p, "id", id);
        return p;
    }

    @Test
    void newDeliveryIsDraft() {
        assertEquals(DocumentStatus.DRAFT, newDraft().getStatus());
    }

    @Test
    void addItemMergesSameProduct() {
        InboundDelivery delivery = newDraft();

        delivery.addItem(product(1L), 3);
        delivery.addItem(product(1L), 4);
        delivery.addItem(product(2L), 5);

        assertEquals(2, delivery.getItems().size());
        assertEquals(7, delivery.getItems().getFirst().getQuantity());
    }

    @Test
    void addItemRejectsZeroOrNegativeQuantity() {
        InboundDelivery delivery = newDraft();

        assertThrows(IllegalArgumentException.class, () -> delivery.addItem(product(1L), 0));
        assertThrows(IllegalArgumentException.class, () -> delivery.addItem(product(1L), -5));
    }

    @Test
    void confirmTwiceIsRejected() {
        InboundDelivery delivery = newDraft();
        delivery.confirm();

        assertThrows(IllegalStateException.class, delivery::confirm);
        assertEquals(DocumentStatus.CONFIRMED, delivery.getStatus());
    }

    @Test
    void itemsCannotChangeAfterConfirm() {
        InboundDelivery delivery = newDraft();
        delivery.addItem(product(1L), 3);
        delivery.confirm();

        assertThrows(IllegalStateException.class, () -> delivery.addItem(product(2L), 1));
        assertThrows(IllegalStateException.class, delivery::clearItems);
        assertEquals(1, delivery.getItems().size());
    }

    @Test
    void cancelOnlyWorksAfterConfirm() {
        InboundDelivery delivery = newDraft();

        assertThrows(IllegalStateException.class, delivery::cancel);

        delivery.confirm();
        delivery.cancel();
        assertEquals(DocumentStatus.CANCELLED, delivery.getStatus());
    }
}