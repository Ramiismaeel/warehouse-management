package training.backend.inbound;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import training.backend.document.DocumentStatus;
import training.backend.inbound.dto.SummaryResponse;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inbound-deliveries")
@RequiredArgsConstructor
public class InboundedDeliveryController {

    private final InboundDeliveryService inboundDeliveryService;

    @GetMapping
    public List<SummaryResponse> getAll(@RequestParam(required = false) DocumentStatus status) {
        return inboundDeliveryService.getAll(status);
    }

}
