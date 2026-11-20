package training.backend.inbound;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import training.backend.document.DocumentNumberGenerator;
import training.backend.document.DocumentStatus;
import training.backend.exceptions.InvalidStatusTransitionException;
import training.backend.exceptions.NotFoundException;
import training.backend.inbound.dto.DetailResponse;
import training.backend.inbound.dto.InboundDeliveryRequest;
import training.backend.inbound.dto.SummaryResponse;
import training.backend.product.Product;
import training.backend.product.ProductRepository;

import java.time.LocalDate;
import java.time.Year;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InboundDeliveryService {

    private final InboundDeliveryRepository inboundDeliveryRepository;
    private final InboundDeliveryMapper inboundDeliveryMapper;
    private final ProductRepository productRepository;


    @Transactional(readOnly = true)
    public List<SummaryResponse> getAll(DocumentStatus status) {
        List<InboundDelivery> deliveries = status == null
                ? inboundDeliveryRepository.findAll()
                : inboundDeliveryRepository.findAllByStatus(status);

        return deliveries.stream()
                .map(inboundDeliveryMapper::toSummaryResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public DetailResponse getById(Long id) {
        return inboundDeliveryMapper.toDetailResponse(findById(id));
    }

    @Transactional
    public DetailResponse create(InboundDeliveryRequest request) {

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
    public DetailResponse update(Long id, InboundDeliveryRequest request) {
        InboundDelivery delivery = findById(id);

        if(!delivery.getStatus().canEdit()) {
            throw new InvalidStatusTransitionException("Cannot edit inbound delivery with status: " , delivery.getStatus());
        }
        delivery.setSupplierName(request.supplierName());
        delivery.setDeliveryDate(request.deliveryDate() != null ? request.deliveryDate() : LocalDate.now());
        delivery.setNote(request.note());
        delivery.clearItems();
        inboundDeliveryRepository.flush();

        request.items().forEach(item -> delivery.addItem(loadProduct(item.productId()), item.quantity()));
        return inboundDeliveryMapper.toDetailResponse(delivery);
    }

    public void delete(Long id) {
        InboundDelivery delivery = findById(id);
        if(!delivery.getStatus().canEdit()) {
            throw new InvalidStatusTransitionException("Cannot delete inbound delivery with status: " , delivery.getStatus());
        }
        inboundDeliveryRepository.delete(delivery);
    }


    private Product loadProduct(Long productId) {
        return productRepository.findById(productId).orElseThrow( () -> new NotFoundException("Product not found with id: ", productId));
    }


    private InboundDelivery findById(Long id) {
        return inboundDeliveryRepository.findWithItemsById(id)
                .orElseThrow(() -> new NotFoundException("Inbound delivery not found with id: " , id));
    }
}
