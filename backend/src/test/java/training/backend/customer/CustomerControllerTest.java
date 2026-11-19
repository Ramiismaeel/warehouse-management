package training.backend.customer;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import training.backend.customer.dto.CustomerRequest;
import training.backend.customer.dto.CustomerResponse;
import training.backend.exceptions.EntityInUseException;
import training.backend.exceptions.NotFoundException;

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** MockMvc tests for CustomerController: status codes, validation, 404 and 409. */
@WebMvcTest(CustomerController.class)
class CustomerControllerTest {

    private static final String BASE = "/api/v1/customers";

    private static final String VALID_BODY = """
            {
              "name": "Müller Bau GmbH",
              "email": "einkauf@mueller-bau.example",
              "phone": "+49 30 1234567",
              "street": "Hauptstraße 12",
              "zipCode": "10115",
              "city": "Berlin"
            }
            """;

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CustomerService customerService;

    // ---------- GET ----------

    @Test
    void getAll_passesSearchTermToService() throws Exception {
        when(customerService.getAll("bau")).thenReturn(List.of(response(1L, "Müller Bau GmbH")));

        mockMvc.perform(get(BASE).param("q", "bau"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Müller Bau GmbH"));
    }

    @Test
    void getById_whenMissing_returns404() throws Exception {
        when(customerService.getById(99L)).thenThrow(new NotFoundException("Kunde", 99L));

        mockMvc.perform(get(BASE + "/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Kunde mit ID 99 wurde nicht gefunden."));
    }

    // ---------- POST ----------

    @Test
    void create_withValidBody_returns201WithLocation() throws Exception {
        when(customerService.createCustomer(any(CustomerRequest.class))).thenReturn(response(9L, "Müller Bau GmbH"));

        mockMvc.perform(post(BASE).contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "http://localhost/api/v1/customers/9"))
                .andExpect(jsonPath("$.id").value(9));
    }

    @Test
    void create_withInvalidFields_returns400WithErrorsAndDoesNotCallService() throws Exception {
        String invalid = """
                { "name": "  ", "email": "kein-email", "zipCode": "123" }
                """;

        mockMvc.perform(post(BASE).contentType(MediaType.APPLICATION_JSON).content(invalid))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.name").value("Name ist erforderlich"))
                .andExpect(jsonPath("$.errors.email").value("Bitte eine gültige E-Mail-Adresse eingeben"))
                .andExpect(jsonPath("$.errors.zipCode").value("PLZ muss aus 5 Ziffern bestehen"));

        verifyNoInteractions(customerService);
    }

    @Test
    void create_withOnlyName_returns201() throws Exception {
        when(customerService.createCustomer(any(CustomerRequest.class))).thenReturn(response(10L, "Nur Name"));

        mockMvc.perform(post(BASE).contentType(MediaType.APPLICATION_JSON).content("{ \"name\": \"Nur Name\" }"))
                .andExpect(status().isCreated());
    }

    // ---------- PUT ----------

    @Test
    void update_whenMissing_returns404() throws Exception {
        when(customerService.updateCustomer(eq(99L), any(CustomerRequest.class)))
                .thenThrow(new NotFoundException("Kunde", 99L));

        mockMvc.perform(put(BASE + "/99").contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
                .andExpect(status().isNotFound());
    }

    // ---------- DELETE ----------

    @Test
    void delete_returns204() throws Exception {
        mockMvc.perform(delete(BASE + "/1"))
                .andExpect(status().isNoContent());

        verify(customerService).deleteCustomer(1L);
    }

    @Test
    void delete_whenUsedInDocument_returns409() throws Exception {
        doThrow(new EntityInUseException("Kunde", "Müller Bau GmbH", 1))
                .when(customerService).deleteCustomer(1L);

        mockMvc.perform(delete(BASE + "/1"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("Kunde „Müller Bau GmbH“ wird in 1 Beleg verwendet."));
    }

    private static CustomerResponse response(Long id, String name) {
        Instant now = Instant.parse("2026-11-19T10:00:00Z");
        return new CustomerResponse(id, name, null, null, null, null, null, now, now);
    }
}