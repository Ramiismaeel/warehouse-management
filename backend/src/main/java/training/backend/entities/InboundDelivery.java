package training.backend.entities;


import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import training.backend.product.Product;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "inbound_delivery")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class InboundDelivery extends BaseEntity{

    @Column(unique = true)
    private String deliveryNumber;
    private String supplierName;

    @Enumerated(EnumType.STRING)
    @Setter(AccessLevel.NONE)
    private DocumentStatus status = DocumentStatus.DRAFT;

    private LocalDate deliveryDate = LocalDate.now();

    private String note;

    @Setter(AccessLevel.NONE)
    @OneToMany(mappedBy = "inboundDelivery", cascade = CascadeType.ALL , orphanRemoval = true)
    private List<InboundDeliveryItem> items = new ArrayList<>();


    /** Read-only view; change items via addItem() / clearItems(). */
    public List<InboundDeliveryItem> getItems() {
        return Collections.unmodifiableList(items);
    }

    /** Adds a line. The same product twice is merged into one line (business rule 6). */
    public void addItem(Product product, int quantity) {
        requireDraft();
        items.stream()
                .filter(item -> Objects.equals(item.getProduct().getId(), product.getId()))
                .findFirst()
                .ifPresentOrElse(
                        item -> item.increaseQuantity(quantity),
                        () -> items.add(new InboundDeliveryItem(this, product, quantity)));
    }

    /** Removes all lines, e.g. before re-adding them when a draft is updated. */
    public void clearItems() {
        requireDraft();
        items.clear();
    }

    /**
     * DRAFT -> CONFIRMED. The service checks status.canConfirm() first and throws the 409 exception;
     * these guards are the last line of defense. The stock change itself happens in StockService.
     */
    public void confirm() {
        if (!status.canConfirm()) {
            throw new IllegalStateException("Cannot confirm inbound delivery in status " + status);
        }
        status = DocumentStatus.CONFIRMED;
    }

    /** CONFIRMED -> CANCELLED. */
    public void cancel() {
        if (!status.canCancel()) {
            throw new IllegalStateException("Cannot cancel inbound delivery in status " + status);
        }
        status = DocumentStatus.CANCELLED;
    }

    private void requireDraft() {
        if (!status.canEdit()) {
            throw new IllegalStateException("Only drafts can be edited, status is " + status);
        }
    }

}
