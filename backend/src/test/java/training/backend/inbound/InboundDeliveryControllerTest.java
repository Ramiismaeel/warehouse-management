package training.backend.inbound;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import training.backend.document.DocumentStatus;
import training.backend.exceptions.InsufficientStockException;
import training.backend.exceptions.InvalidStatusTransitionException;
import training.backend.exceptions.NotFoundException;
import training.backend.inbound.dto.InboundDeliveryItemResponse;
import training.backend.inbound.dto.InboundDeliveryDetailResponse;
import training.backend.inbound.dto.InboundDeliveryRequest;
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

/** MockMvc tests for InboundDeliveryController: 200/201/204, 400 (validation), 404 and 409. */
@WebMvcTest(InboundDeliveryController.class)
class InboundDeliveryControllerTest {

    private static final String BASE = "/api/v1/inbound-deliveries";

    private static final String VALID_BODY = """
            {"supplierName": "Müller GmbH", "deliveryDate": "2026-11-20", "items": [{"productId": 7, "quantity": 20}]}
            """;

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private InboundDeliveryService inboundDeliveryService;

    // ---------- list / detail ----------

    @Test
    void getAll_withUnknownStatus_returns400() throws Exception {
        mockMvc.perform(get(BASE).param("status", "FOO"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("Ungültiger Wert „FOO“ für Parameter „status“."));

        verifyNoInteractions(inboundDeliveryService);
    }

    @Test
    void getById_whenUnknownId_returns404() throws Exception {
        when(inboundDeliveryService.getById(99L)).thenThrow(new NotFoundException("Wareneingang", 99L));

        mockMvc.perform(get(BASE + "/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Wareneingang mit ID 99 wurde nicht gefunden."));
    }

    // ---------- create ----------

    @Test
    void create_returns201WithLocation() throws Exception {
        when(inboundDeliveryService.create(any(InboundDeliveryRequest.class))).thenReturn(detail(1L, DocumentStatus.DRAFT));

        mockMvc.perform(post(BASE).contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "http://localhost" + BASE + "/1"))
                .andExpect(jsonPath("$.number").value("WE-2026-0001"))
                .andExpect(jsonPath("$.status").value("DRAFT"));
    }

    @Test
    void create_withoutSupplierAndItems_returns400WithErrors() throws Exception {
        mockMvc.perform(post(BASE).contentType(MediaType.APPLICATION_JSON).content("{\"items\": []}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.supplierName").value("Lieferant ist erforderlich"))
                .andExpect(jsonPath("$.errors.items").value("Mindestens eine Position ist erforderlich"));

        verifyNoInteractions(inboundDeliveryService);
    }

    @Test
    void create_withSupplierNameTooLong_returns400() throws Exception {
        String body = VALID_BODY.replace("Müller GmbH", "x".repeat(256));

        mockMvc.perform(post(BASE).contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.supplierName").value("Lieferant darf höchstens 255 Zeichen lang sein"));

        verifyNoInteractions(inboundDeliveryService);
    }

    @Test
    void create_withNullItem_returns400() throws Exception {
        mockMvc.perform(post(BASE).contentType(MediaType.APPLICATION_JSON)
                        .content("{\"supplierName\": \"Müller GmbH\", \"items\": [null]}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors['items[0]']").value("Position darf nicht leer sein"));

        verifyNoInteractions(inboundDeliveryService);
    }

    @Test
    void create_withInvalidQuantities_returns400() throws Exception {
        String body = """
                {"supplierName": "Müller GmbH", "items": [
                  {"productId": 7, "quantity": 0},
                  {"productId": 8, "quantity": 1000001}
                ]}
                """;

        mockMvc.perform(post(BASE).contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors['items[0].quantity']").value("Menge muss mindestens 1 sein"))
                .andExpect(jsonPath("$.errors['items[1].quantity']").value("Menge darf höchstens 1.000.000 sein"));

        verifyNoInteractions(inboundDeliveryService);
    }

    // ---------- update / delete ----------

    @Test
    void update_returns200() throws Exception {
        when(inboundDeliveryService.update(eq(1L), any(InboundDeliveryRequest.class)))
                .thenReturn(detail(1L, DocumentStatus.DRAFT));

        mockMvc.perform(put(BASE + "/1").contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void update_whenInvalid_returns400() throws Exception {
        mockMvc.perform(put(BASE + "/1").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.supplierName").value("Lieferant ist erforderlich"))
                .andExpect(jsonPath("$.errors.items").value("Mindestens eine Position ist erforderlich"));

        verifyNoInteractions(inboundDeliveryService);
    }

    @Test
    void update_whenUnknownId_returns404() throws Exception {
        when(inboundDeliveryService.update(eq(99L), any(InboundDeliveryRequest.class)))
                .thenThrow(new NotFoundException("Wareneingang", 99L));

        mockMvc.perform(put(BASE + "/99").contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Wareneingang mit ID 99 wurde nicht gefunden."));
    }

    @Test
    void update_whenNotDraft_returns409() throws Exception {
        when(inboundDeliveryService.update(eq(1L), any(InboundDeliveryRequest.class)))
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
    void delete_whenUnknownId_returns404() throws Exception {
        doThrow(new NotFoundException("Wareneingang", 99L)).when(inboundDeliveryService).delete(99L);

        mockMvc.perform(delete(BASE + "/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void delete_whenNotDraft_returns409() throws Exception {
        doThrow(new InvalidStatusTransitionException("Löschen", DocumentStatus.CANCELLED))
                .when(inboundDeliveryService).delete(1L);

        mockMvc.perform(delete(BASE + "/1"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("„Löschen“ ist im Status „Storniert“ nicht möglich."));
    }

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

    private static InboundDeliveryDetailResponse detail(Long id, DocumentStatus status) {
        return new InboundDeliveryDetailResponse(id, "WE-2026-0001", "Müller GmbH", LocalDate.of(2026, 11, 20), status,
                1, 20, null,
                List.of(new InboundDeliveryItemResponse(7L, "A-1001", "Schraube M4", 20, ProductUnit.PIECE)));
    }
}
