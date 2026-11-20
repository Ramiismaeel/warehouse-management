package training.backend.inbound;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import training.backend.document.DocumentStatus;
import training.backend.inbound.dto.DetailResponse;
import training.backend.inbound.dto.InboundDeliveryRequest;
import training.backend.inbound.dto.SummaryResponse;
import training.backend.product.dto.ProductResponse;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/inbound-deliveries")
@RequiredArgsConstructor
public class InboundDeliveryController {

    private final InboundDeliveryService inboundDeliveryService;

    @GetMapping
    public List<SummaryResponse> getAll(@RequestParam(required = false) DocumentStatus status) {
        return inboundDeliveryService.getAll(status);
    }

    @GetMapping("/{id}")
    public DetailResponse getById(@PathVariable Long id) {
        return inboundDeliveryService.getById(id);
    }

    @PostMapping
    public ResponseEntity<DetailResponse> create(@Valid @RequestBody InboundDeliveryRequest request) {
        DetailResponse created = inboundDeliveryService.create(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.id())
                .toUri();
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    public DetailResponse update(@Valid @RequestBody InboundDeliveryRequest request, @PathVariable Long id) {
        return inboundDeliveryService.update(id, request);
    }

    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        inboundDeliveryService.delete(id);
    }

}
