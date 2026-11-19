package training.backend.entities;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import training.backend.customer.Customer;
import training.backend.document.DocumentStatus;
import training.backend.product.Product;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "outbound_order")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class OutboundOrder extends BaseEntity {

    @Column(unique = true)
    private String orderNumber; // WA-2026-

    @Enumerated(EnumType.STRING)
    @Setter(AccessLevel.NONE)
    private DocumentStatus status = DocumentStatus.DRAFT;
    private LocalDate orderDate = LocalDate.now();

    private String note;

    @JoinColumn(name = "customer_id", nullable = false)
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    private Customer customer;


    @Setter(AccessLevel.NONE)
    @OneToMany(mappedBy = "outboundOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OutboundOrderItem> items = new ArrayList<>();


    /** Read-only view; change items via addItem() / clearItems(). */
    public List<OutboundOrderItem> getItems() {
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
                        () -> items.add(new OutboundOrderItem(this, product, quantity)));
    }

    /** Removes all lines, e.g. before re-adding them when a draft is updated. */
    public void clearItems() {
        requireDraft();
        items.clear();
    }

    /** DRAFT -> CONFIRMED. The service checks first and throws the 409; this is the last safety net. */
    public void confirm() {
        if (!status.canConfirm()) {
            throw new IllegalStateException("Cannot confirm outbound order in status " + status);
        }
        status = DocumentStatus.CONFIRMED;
    }

    /** CONFIRMED -> CANCELLED. */
    public void cancel() {
        if (!status.canCancel()) {
            throw new IllegalStateException("Cannot cancel outbound order in status " + status);
        }
        status = DocumentStatus.CANCELLED;
    }

    private void requireDraft() {
        if (!status.canEdit()) {
            throw new IllegalStateException("Only drafts can be edited, status is " + status);
        }
    }


}
