package training.backend.outbound;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import training.backend.customer.Customer;
import training.backend.customer.CustomerRepository;
import training.backend.document.DocumentNumberGenerator;
import training.backend.document.DocumentStatus;
import training.backend.exceptions.InvalidStatusTransitionException;
import training.backend.exceptions.NotFoundException;
import training.backend.outbound.dto.OutboundOrderDetailResponse;
import training.backend.outbound.dto.OutboundOrderRequest;
import training.backend.outbound.dto.OutboundOrderSummaryResponse;
import training.backend.product.Product;
import training.backend.product.ProductRepository;
import training.backend.stock.StockChange;
import training.backend.stock.StockDirection;
import training.backend.stock.StockService;

import java.time.LocalDate;
import java.time.Year;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OutboundOrderService {

    private final OutboundOrderRepository outboundOrderRepository;
    private final OutboundOrderMapper outboundOrderMapper;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final StockService stockService;

    @Transactional(readOnly = true)
    public List<OutboundOrderSummaryResponse> getAll(DocumentStatus status) {
        List<OutboundOrder> orders = status == null
                ? outboundOrderRepository.findAll()
                : outboundOrderRepository.findAllByStatus(status);

        return orders.stream()
                .map(outboundOrderMapper::toSummaryResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public OutboundOrderDetailResponse getById(Long id) {
        return outboundOrderMapper.toDetailResponse(findById(id));
    }

    @Transactional
    public OutboundOrderDetailResponse create(OutboundOrderRequest request) {
        OutboundOrder order = new OutboundOrder();
        applyHeader(order, request);
        request.items().forEach(item -> order.addItem(loadProduct(item.productId()), item.quantity()));

        OutboundOrder saved = outboundOrderRepository.save(order);
        saved.setOrderNumber(DocumentNumberGenerator.format("WA", Year.now().getValue(), saved.getId()));
        return outboundOrderMapper.toDetailResponse(saved);
    }

    @Transactional
    public OutboundOrderDetailResponse update(Long id, OutboundOrderRequest request) {
        OutboundOrder order = findById(id);
        if (!order.getStatus().canEdit()) {
            throw new InvalidStatusTransitionException("Bearbeiten", order.getStatus());
        }
        applyHeader(order, request);
        order.clearItems();
        outboundOrderRepository.flush(); // delete old lines first, otherwise the unique (order, product) constraint hits

        request.items().forEach(item -> order.addItem(loadProduct(item.productId()), item.quantity()));
        return outboundOrderMapper.toDetailResponse(order);
    }

    @Transactional
    public void delete(Long id) {
        OutboundOrder order = findById(id);
        if (!order.getStatus().canEdit()) {
            throw new InvalidStatusTransitionException("Löschen", order.getStatus());
        }
        outboundOrderRepository.delete(order);
    }

    /**
     * DRAFT -> CONFIRMED and stock - for every item, in one transaction (business rule 4).
     * Any shortage rejects the whole confirm and lists every shortage (rule 3).
     */
    @Transactional
    public OutboundOrderDetailResponse confirm(Long id) {
        OutboundOrder order = findById(id);
        if (!order.getStatus().canConfirm()) {
            throw new InvalidStatusTransitionException("Bestätigen", order.getStatus());
        }
        stockService.apply(toStockChanges(order), StockDirection.OUT);
        order.confirm();
        return outboundOrderMapper.toDetailResponse(order);
    }

    /** CONFIRMED -> CANCELLED and stock + for every item, in one transaction (business rule 4). */
    @Transactional
    public OutboundOrderDetailResponse cancel(Long id) {
        OutboundOrder order = findById(id);
        if (!order.getStatus().canCancel()) {
            throw new InvalidStatusTransitionException("Stornieren", order.getStatus());
        }
        stockService.apply(toStockChanges(order), StockDirection.IN);
        order.cancel();
        return outboundOrderMapper.toDetailResponse(order);
    }

    private void applyHeader(OutboundOrder order, OutboundOrderRequest request) {
        order.setCustomer(loadCustomer(request.customerId()));
        order.setOrderDate(request.orderDate() != null ? request.orderDate() : LocalDate.now());
        order.setNote(request.note());
    }

    private static List<StockChange> toStockChanges(OutboundOrder order) {
        return order.getItems().stream()
                .map(item -> new StockChange(item.getProduct().getId(), item.getQuantity()))
                .toList();
    }

    private Customer loadCustomer(Long customerId) {
        return customerRepository.findById(customerId)
                .orElseThrow(() -> new NotFoundException("Kunde", customerId));
    }

    private Product loadProduct(Long productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("Artikel", productId));
    }

    private OutboundOrder findById(Long id) {
        return outboundOrderRepository.findWithItemsById(id)
                .orElseThrow(() -> new NotFoundException("Warenausgang", id));
    }
}
