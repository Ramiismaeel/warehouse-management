package training.backend.inbound;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import training.backend.document.DocumentStatus;
import training.backend.exceptions.InsufficientStockException;
import training.backend.exceptions.InvalidStatusTransitionException;
import training.backend.exceptions.NotFoundException;
import training.backend.inbound.dto.DeliveryItemResponse;
import training.backend.inbound.dto.DetailResponse;
import training.backend.product.ProductUnit;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** MockMvc tests for the WM-28 status actions of InboundDeliveryController: 200, 404 and 409. */
@WebMvcTest(InboundDeliveryController.class)
class InboundDeliveryControllerTest {

    private static final String BASE = "/api/v1/inbound-deliveries";

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private InboundDeliveryService inboundDeliveryService;

    // ---------- confirm ----------

    @Test
    void confirm_returns200WithConfirmedDelivery() throws Exception {
        when(inboundDeliveryService.confirm(1L)).thenReturn(detail(1L, DocumentStatus.CONFIRMED));

        mockMvc.perform(post(BASE + "/1/confirm"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.number").value("WE-2026-0001"))
                .andExpect(jsonPath("$.status").value("CONFIRMED"))
                .andExpect(jsonPath("$.items[0].sku").value("A-1001"));
    }

    @Test
    void confirm_whenUnknownId_returns404() throws Exception {
        when(inboundDeliveryService.confirm(99L)).thenThrow(new NotFoundException("Wareneingang", 99L));

        mockMvc.perform(post(BASE + "/99/confirm"))
                .andExpect(status().isNotFound());
    }

    @Test
    void confirm_whenAlreadyConfirmed_returns409() throws Exception {
        when(inboundDeliveryService.confirm(1L))
                .thenThrow(new InvalidStatusTransitionException("Bestätigen", DocumentStatus.CONFIRMED));

        mockMvc.perform(post(BASE + "/1/confirm"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("„Bestätigen“ ist im Status „Bestätigt“ nicht möglich."));
    }

    // ---------- cancel ----------

    @Test
    void cancel_returns200WithCancelledDelivery() throws Exception {
        when(inboundDeliveryService.cancel(1L)).thenReturn(detail(1L, DocumentStatus.CANCELLED));

        mockMvc.perform(post(BASE + "/1/cancel"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));
    }

    @Test
    void cancel_whenDraft_returns409() throws Exception {
        when(inboundDeliveryService.cancel(1L))
                .thenThrow(new InvalidStatusTransitionException("Stornieren", DocumentStatus.DRAFT));

        mockMvc.perform(post(BASE + "/1/cancel"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("„Stornieren“ ist im Status „Entwurf“ nicht möglich."));
    }

    @Test
    void cancel_whenStockAlreadyShipped_returns409WithShortages() throws Exception {
        when(inboundDeliveryService.cancel(1L)).thenThrow(new InsufficientStockException(List.of(
                new InsufficientStockException.Shortage(7L, "A-1001", "Schraube M4", 20, 5))));

        mockMvc.perform(post(BASE + "/1/cancel"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("Nicht genügend Bestand für „Schraube M4“: benötigt 20, verfügbar 5."))
                .andExpect(jsonPath("$.shortages.length()").value(1))
                .andExpect(jsonPath("$.shortages[0].productId").value(7))
                .andExpect(jsonPath("$.shortages[0].sku").value("A-1001"))
                .andExpect(jsonPath("$.shortages[0].name").value("Schraube M4"))
                .andExpect(jsonPath("$.shortages[0].requested").value(20))
                .andExpect(jsonPath("$.shortages[0].available").value(5));
    }

    // ---------- helpers ----------

    private static DetailResponse detail(Long id, DocumentStatus status) {
        return new DetailResponse(id, "WE-2026-0001", "Müller GmbH", LocalDate.of(2026, 11, 20), status,
                1, 20, null,
                List.of(new DeliveryItemResponse(7L, "A-1001", "Schraube M4", 20, ProductUnit.PIECE)));
    }
}
