package training.backend.inbound;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import training.backend.document.DocumentStatus;
import training.backend.inbound.dto.SummaryResponse;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InboundDeliveryService {

    private final InboundDeliveryRepository inboundDeliveryRepository;
    private final InboundDeliveryMapper inboundDeliveryMapper;


    @Transactional(readOnly = true)
    public List<SummaryResponse> getAll(DocumentStatus status) {
        List<InboundDelivery> deliveries = status == null
                ? inboundDeliveryRepository.findAll()
                : inboundDeliveryRepository.findAllByStatus(status);

        return deliveries.stream()
                .map(inboundDeliveryMapper::toResponse)
                .toList();
    }
}
