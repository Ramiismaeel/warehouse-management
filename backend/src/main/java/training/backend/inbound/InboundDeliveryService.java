package training.backend.inbound;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import training.backend.document.DocumentNumberGenerator;
import training.backend.document.DocumentStatus;
import training.backend.exceptions.InvalidStatusTransitionException;
import training.backend.exceptions.NotFoundException;
import training.backend.inbound.dto.InboundDeliveryDetailResponse;
import training.backend.inbound.dto.InboundDeliveryRequest;
import training.backend.inbound.dto.InboundDeliverySummaryResponse;
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
public class InboundDeliveryService {

    private final InboundDeliveryRepository inboundDeliveryRepository;
    private final InboundDeliveryMapper inboundDeliveryMapper;
    private final ProductRepository productRepository;
    private final StockService stockService;


    @Transactional(readOnly = true)
    public List<InboundDeliverySummaryResponse> getAll(DocumentStatus status) {
        List<InboundDelivery> deliveries = status == null
                ? inboundDeliveryRepository.findAll()
                : inboundDeliveryRepository.findAllByStatus(status);

        return deliveries.stream()
                .map(inboundDeliveryMapper::toSummaryResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public InboundDeliveryDetailResponse getById(Long id) {
        return inboundDeliveryMapper.toDetailResponse(findById(id));
    }

    @Transactional
    public InboundDeliveryDetailResponse create(InboundDeliveryRequest request) {

        InboundDelivery delivery = new InboundDelivery();
        delivery.setSupplierName(request.supplierName());
        delivery.setDeliveryDate(request.deliveryDate() != null ? request.deliveryDate() : LocalDate.now());
        delivery.setNote(request.note());
        request.items().forEach(item -> delivery.addItem(loadProduct(item.productId()), item.quantity()));
        InboundDelivery saved = inboundDeliveryRepository.save(delivery);
        saved.setDeliveryNumber(DocumentNumberGenerator.format(
                "WE", Year.now().getValue(), saved.getId()));

        return inboundDeliveryMapper.toDetailResponse(saved);


    }

    @Transactional
    public InboundDeliveryDetailResponse update(Long id, InboundDeliveryRequest request) {
        InboundDelivery delivery = findById(id);

        if(!delivery.getStatus().canEdit()) {
            throw new InvalidStatusTransitionException("Bearbeiten", delivery.getStatus());
        }
        delivery.setSupplierName(request.supplierName());
        delivery.setDeliveryDate(request.deliveryDate() != null ? request.deliveryDate() : LocalDate.now());
        delivery.setNote(request.note());
        delivery.clearItems();
        inboundDeliveryRepository.flush();

        request.items().forEach(item -> delivery.addItem(loadProduct(item.productId()), item.quantity()));
        return inboundDeliveryMapper.toDetailResponse(delivery);
    }

    @Transactional
    public void delete(Long id) {
        InboundDelivery delivery = findById(id);
        if(!delivery.getStatus().canEdit()) {
            throw new InvalidStatusTransitionException("Löschen", delivery.getStatus());
        }
        inboundDeliveryRepository.delete(delivery);
    }


    /** DRAFT -> CONFIRMED and stock + for every item, in one transaction (business rule 4). */
    @Transactional
    public InboundDeliveryDetailResponse confirm(Long id) {
        InboundDelivery delivery = findById(id);
        if (!delivery.getStatus().canConfirm()) {
            throw new InvalidStatusTransitionException("Bestätigen", delivery.getStatus());
        }
        stockService.apply(toStockChanges(delivery), StockDirection.IN);
        delivery.confirm();
        return inboundDeliveryMapper.toDetailResponse(delivery);
    }

    /**
     * CONFIRMED -> CANCELLED and stock - for every item, in one transaction (business rule 4).
     * If goods were already shipped, StockService rejects the whole cancel with all shortages (rule 3).
     */
    @Transactional
    public InboundDeliveryDetailResponse cancel(Long id) {
        InboundDelivery delivery = findById(id);
        if (!delivery.getStatus().canCancel()) {
            throw new InvalidStatusTransitionException("Stornieren", delivery.getStatus());
        }
        stockService.apply(toStockChanges(delivery), StockDirection.OUT);
        delivery.cancel();
        return inboundDeliveryMapper.toDetailResponse(delivery);
    }

    private static List<StockChange> toStockChanges(InboundDelivery delivery) {
        return delivery.getItems().stream()
                .map(item -> new StockChange(item.getProduct().getId(), item.getQuantity()))
                .toList();
    }

    private Product loadProduct(Long productId) {
        return productRepository.findById(productId).orElseThrow( () -> new NotFoundException("Artikel", productId));
    }


    private InboundDelivery findById(Long id) {
        return inboundDeliveryRepository.findWithItemsById(id)
                .orElseThrow(() -> new NotFoundException("Wareneingang", id));
    }
}
