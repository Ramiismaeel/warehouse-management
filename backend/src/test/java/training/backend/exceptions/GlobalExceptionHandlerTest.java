package training.backend.exceptions;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import training.backend.document.DocumentStatus;

import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/** Checks that every exception type maps to the documented status and ProblemDetail shape. */
class GlobalExceptionHandlerTest {

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new TestController())
                .setControllerAdvice(new GlobalExceptionHandler())
                .defaultResponseCharacterEncoding(StandardCharsets.UTF_8) // German umlauts
                .build();
    }

    @Test
    void validationError_returns400WithErrorsMap() throws Exception {
        mockMvc.perform(post("/test/validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\": \"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Ungültige Eingabe"))
                .andExpect(jsonPath("$.errors.name").value("Name ist erforderlich"));
    }

    @Test
    void malformedJson_returns400() throws Exception {
        mockMvc.perform(post("/test/validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{not json"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Ungültige Eingabe"));
    }

    @Test
    void notFound_returns404() throws Exception {
        mockMvc.perform(get("/test/not-found"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Artikel mit ID 42 wurde nicht gefunden."));
    }

    @Test
    void duplicateValue_returns409WithFieldError() throws Exception {
        mockMvc.perform(get("/test/duplicate"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.errors.sku").value("Die SKU „A-1001“ ist bereits vergeben."));
    }

    @Test
    void entityInUse_returns409() throws Exception {
        mockMvc.perform(get("/test/in-use"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("Artikel „Schraube M4“ wird in 3 Belegen verwendet."));
    }

    @Test
    void insufficientStock_returns409WithShortages() throws Exception {
        mockMvc.perform(get("/test/insufficient-stock"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.shortages[0].sku").value("A-1001"))
                .andExpect(jsonPath("$.shortages[0].requested").value(5))
                .andExpect(jsonPath("$.shortages[0].available").value(2));
    }

    @Test
    void invalidStatusTransition_returns409() throws Exception {
        mockMvc.perform(get("/test/invalid-status"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("„Bestätigen“ ist im Status „Storniert“ nicht möglich."));
    }

    @Test
    void unexpectedError_returns500WithoutInternals() throws Exception {
        mockMvc.perform(get("/test/boom"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.title").value("Interner Fehler"));
    }

    /** Controller that exists only in this test and throws each exception type. */
    @RestController
    @RequestMapping("/test")
    static class TestController {

        public record NameRequest(@NotBlank(message = "Name ist erforderlich") String name) {
        }

        @PostMapping("/validate")
        void validate(@Valid @RequestBody NameRequest request) {
        }

        @GetMapping("/not-found")
        void notFound() {
            throw new NotFoundException("Artikel", 42);
        }

        @GetMapping("/duplicate")
        void duplicate() {
            throw new DuplicateValueException("sku", "Die SKU „A-1001“ ist bereits vergeben.");
        }

        @GetMapping("/in-use")
        void inUse() {
            throw new EntityInUseException("Artikel", "Schraube M4", 3);
        }

        @GetMapping("/insufficient-stock")
        void insufficientStock() {
            throw new InsufficientStockException(List.of(
                    new InsufficientStockException.Shortage(1L, "A-1001", "Schraube M4", 5, 2)));
        }

        @GetMapping("/invalid-status")
        void invalidStatus() {
            throw new InvalidStatusTransitionException("Bestätigen", DocumentStatus.CANCELLED);
        }

        @GetMapping("/boom")
        void boom() {
            throw new IllegalStateException("internal detail that must not reach the user");
        }
    }
}