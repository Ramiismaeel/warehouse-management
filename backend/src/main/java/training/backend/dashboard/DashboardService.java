package training.backend.dashboard;


import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Limit;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import training.backend.customer.CustomerRepository;
import training.backend.document.DocumentStatus;
import training.backend.inbound.InboundDeliveryMapper;
import training.backend.inbound.InboundDeliveryRepository;
import training.backend.outbound.OutboundOrderMapper;
import training.backend.outbound.OutboundOrderRepository;
import training.backend.product.ProductMapper;
import training.backend.product.ProductRepository;


@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    static final int LOW_STOCK_LIMIT = 10;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final InboundDeliveryRepository inboundDeliveryRepository;
    private final OutboundOrderRepository outboundOrderRepository;

    private final ProductMapper productMapper;
    private final InboundDeliveryMapper inboundDeliveryMapper;
    private final OutboundOrderMapper outboundOrderMapper;

    public DashboardResponse getDashboard() {
       return new DashboardResponse(
               productRepository.count(),
               customerRepository.count(),
               productRepository.countLowStock(),
                productRepository.countByQuantity(0),
                inboundDeliveryRepository.countByStatus(DocumentStatus.DRAFT),
                outboundOrderRepository.countByStatus(DocumentStatus.DRAFT),
               productRepository.findLowStock(Limit.of(LOW_STOCK_LIMIT)).stream()
                       .map(productMapper::toResponse)
                       .toList(),
               inboundDeliveryRepository.findTop5ByOrderByCreatedAtDescIdDesc()
                          .stream()
                          .map(inboundDeliveryMapper::toSummaryResponse)
                          .toList(),
               outboundOrderRepository.findTop5ByOrderByCreatedAtDescIdDesc().stream()
                       .map(outboundOrderMapper::toSummaryResponse)
                       .toList()
       );
    }
}
