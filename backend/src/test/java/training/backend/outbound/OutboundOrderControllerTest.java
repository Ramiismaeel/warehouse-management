package training.backend.outbound;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import training.backend.customer.dto.CustomerResponse;
import training.backend.document.DocumentStatus;
import training.backend.exceptions.InsufficientStockException;
import training.backend.exceptions.InvalidStatusTransitionException;
import training.backend.exceptions.NotFoundException;
import training.backend.outbound.dto.OutboundOrderDetailResponse;
import training.backend.outbound.dto.OutboundOrderItemResponse;
import training.backend.outbound.dto.OutboundOrderRequest;
import training.backend.product.ProductUnit;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** MockMvc tests for OutboundOrderController (WM-31 / WM-32): 201, 400, 404 and 409. */
@WebMvcTest(OutboundOrderController.class)
class OutboundOrderControllerTest {

    private static final String BASE = "/api/v1/outbound-orders";

    private static final String VALID_BODY = """
            {"customerId": 3, "orderDate": "2026-11-20", "items": [{"productId": 7, "quantity": 20}]}
            """;

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private OutboundOrderService outboundOrderService;

    // ---------- create ----------

    @Test
    void create_returns201WithLocation() throws Exception {
        when(outboundOrderService.create(any(OutboundOrderRequest.class))).thenReturn(detail(1L, DocumentStatus.DRAFT));

        mockMvc.perform(post(BASE).contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "http://localhost" + BASE + "/1"))
                .andExpect(jsonPath("$.number").value("WA-2026-0001"))
                .andExpect(jsonPath("$.customerName").value("Müller Bau GmbH"))
                .andExpect(jsonPath("$.orderDate").value("2026-11-20"))
                .andExpect(jsonPath("$.status").value("DRAFT"));
    }

    @Test
    void create_withoutCustomerAndItems_returns400WithErrors() throws Exception {
        mockMvc.perform(post(BASE).contentType(MediaType.APPLICATION_JSON).content("{\"items\": []}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.customerId").value("Kunde ist erforderlich"))
                .andExpect(jsonPath("$.errors.items").value("Mindestens eine Position ist erforderlich"));

        verifyNoInteractions(outboundOrderService);
    }

    @Test
    void create_withZeroQuantity_returns400() throws Exception {
        mockMvc.perform(post(BASE).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"customerId\": 3, \"items\": [{\"productId\": 7, \"quantity\": 0}]}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors['items[0].quantity']").value("Menge muss mindestens 1 sein"));
    }

    @Test
    void create_withUnknownCustomer_returns404() throws Exception {
        when(outboundOrderService.create(any(OutboundOrderRequest.class)))
                .thenThrow(new NotFoundException("Kunde", 3L));

        mockMvc.perform(post(BASE).contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Kunde mit ID 3 wurde nicht gefunden."));
    }

    @Test
    void create_withNullItem_returns400() throws Exception {
        mockMvc.perform(post(BASE).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"customerId\": 3, \"items\": [null]}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors['items[0]']").value("Position darf nicht leer sein"));

        verifyNoInteractions(outboundOrderService);
    }

    @Test
    void create_withQuantityTooLarge_returns400() throws Exception {
        mockMvc.perform(post(BASE).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"customerId\": 3, \"items\": [{\"productId\": 7, \"quantity\": 1000001}]}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors['items[0].quantity']").value("Menge darf höchstens 1.000.000 sein"));

        verifyNoInteractions(outboundOrderService);
    }

    // ---------- detail ----------

    @Test
    void getById_whenUnknownId_returns404() throws Exception {
        when(outboundOrderService.getById(99L)).thenThrow(new NotFoundException("Warenausgang", 99L));

        mockMvc.perform(get(BASE + "/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Warenausgang mit ID 99 wurde nicht gefunden."));
    }

    // ---------- update / delete ----------

    @Test
    void update_whenInvalid_returns400() throws Exception {
        mockMvc.perform(put(BASE + "/1").contentType(MediaType.APPLICATION_JSON).content("{\"items\": []}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.customerId").value("Kunde ist erforderlich"))
                .andExpect(jsonPath("$.errors.items").value("Mindestens eine Position ist erforderlich"));

        verifyNoInteractions(outboundOrderService);
    }

    @Test
    void update_whenUnknownId_returns404() throws Exception {
        when(outboundOrderService.update(eq(99L), any(OutboundOrderRequest.class)))
                .thenThrow(new NotFoundException("Warenausgang", 99L));

        mockMvc.perform(put(BASE + "/99").contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Warenausgang mit ID 99 wurde nicht gefunden."));
    }

    @Test
    void delete_whenUnknownId_returns404() throws Exception {
        doThrow(new NotFoundException("Warenausgang", 99L)).when(outboundOrderService).delete(99L);

        mockMvc.perform(delete(BASE + "/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void update_whenNotDraft_returns409() throws Exception {
        when(outboundOrderService.update(eq(1L), any(OutboundOrderRequest.class)))
                .thenThrow(new InvalidStatusTransitionException("Bearbeiten", DocumentStatus.CONFIRMED));

        mockMvc.perform(put(BASE + "/1").contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("„Bearbeiten“ ist im Status „Bestätigt“ nicht möglich."));
    }

    @Test
    void delete_returns204() throws Exception {
        mockMvc.perform(delete(BASE + "/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void delete_whenNotDraft_returns409() throws Exception {
        doThrow(new InvalidStatusTransitionException("Löschen", DocumentStatus.CANCELLED))
                .when(outboundOrderService).delete(1L);

        mockMvc.perform(delete(BASE + "/1"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("„Löschen“ ist im Status „Storniert“ nicht möglich."));
    }

    // ---------- confirm / cancel ----------

    @Test
    void confirm_returns200WithConfirmedOrder() throws Exception {
        when(outboundOrderService.confirm(1L)).thenReturn(detail(1L, DocumentStatus.CONFIRMED));

        mockMvc.perform(post(BASE + "/1/confirm"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CONFIRMED"))
                .andExpect(jsonPath("$.customer.id").value(3))
                .andExpect(jsonPath("$.items[0].sku").value("A-1001"));
    }

    @Test
    void confirm_whenStockInsufficient_returns409WithShortages() throws Exception {
        when(outboundOrderService.confirm(1L)).thenThrow(new InsufficientStockException(List.of(
                new InsufficientStockException.Shortage(7L, "A-1001", "Schraube M4", 20, 5))));

        mockMvc.perform(post(BASE + "/1/confirm"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.shortages.length()").value(1))
                .andExpect(jsonPath("$.shortages[0].productId").value(7))
                .andExpect(jsonPath("$.shortages[0].requested").value(20))
                .andExpect(jsonPath("$.shortages[0].available").value(5));
    }

    @Test
    void confirm_whenUnknownId_returns404() throws Exception {
        when(outboundOrderService.confirm(99L)).thenThrow(new NotFoundException("Warenausgang", 99L));

        mockMvc.perform(post(BASE + "/99/confirm"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Warenausgang mit ID 99 wurde nicht gefunden."));
    }

    @Test
    void cancel_returns200WithCancelledOrder() throws Exception {
        when(outboundOrderService.cancel(1L)).thenReturn(detail(1L, DocumentStatus.CANCELLED));

        mockMvc.perform(post(BASE + "/1/cancel"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));
    }

    @Test
    void cancel_whenDraft_returns409() throws Exception {
        when(outboundOrderService.cancel(1L))
                .thenThrow(new InvalidStatusTransitionException("Stornieren", DocumentStatus.DRAFT));

        mockMvc.perform(post(BASE + "/1/cancel"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("„Stornieren“ ist im Status „Entwurf“ nicht möglich."));
    }

    // ---------- helpers ----------

    private static OutboundOrderDetailResponse detail(Long id, DocumentStatus status) {
        return new OutboundOrderDetailResponse(id, "WA-2026-0001", "Müller Bau GmbH", LocalDate.of(2026, 11, 20),
                status, 1, 20, null,
                new CustomerResponse(3L, "Müller Bau GmbH", null, null, null, null,
                        null, null, null),
                List.of(new OutboundOrderItemResponse(7L, "A-1001", "Schraube M4", 20, ProductUnit.PIECE)));
    }
}
