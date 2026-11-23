package training.backend.outbound;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import training.backend.document.DocumentStatus;
import training.backend.outbound.dto.OutboundOrderDetailResponse;
import training.backend.outbound.dto.OutboundOrderRequest;
import training.backend.outbound.dto.OutboundOrderSummaryResponse;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/outbound-orders")
@RequiredArgsConstructor
public class OutboundOrderController {

    private final OutboundOrderService outboundOrderService;

    @GetMapping
    public List<OutboundOrderSummaryResponse> getAll(@RequestParam(required = false) DocumentStatus status) {
        return outboundOrderService.getAll(status);
    }

    @GetMapping("/{id}")
    public OutboundOrderDetailResponse getById(@PathVariable Long id) {
        return outboundOrderService.getById(id);
    }

    @PostMapping
    public ResponseEntity<OutboundOrderDetailResponse> create(@Valid @RequestBody OutboundOrderRequest request) {
        OutboundOrderDetailResponse created = outboundOrderService.create(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(created.id())
                .toUri();
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    public OutboundOrderDetailResponse update(@PathVariable Long id, @Valid @RequestBody OutboundOrderRequest request) {
        return outboundOrderService.update(id, request);
    }

    @PostMapping("/{id}/confirm")
    public OutboundOrderDetailResponse confirm(@PathVariable Long id) {
        return outboundOrderService.confirm(id);
    }

    @PostMapping("/{id}/cancel")
    public OutboundOrderDetailResponse cancel(@PathVariable Long id) {
        return outboundOrderService.cancel(id);
    }

    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        outboundOrderService.delete(id);
    }
}
