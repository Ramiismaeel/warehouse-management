package training.backend.product;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import training.backend.exceptions.DuplicateValueException;
import training.backend.exceptions.EntityInUseException;
import training.backend.exceptions.NotFoundException;
import training.backend.product.dto.ProductRequest;
import training.backend.product.dto.ProductResponse;

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

/** MockMvc tests for ProductController: status codes, JSON shape, validation, 404 and 409. */
@WebMvcTest(ProductController.class)
class ProductControllerTest {

    private static final String BASE = "/api/v1/products";

    private static final String VALID_BODY = """
            {
              "sku": "A-1001",
              "name": "Schraube M4",
              "description": "Edelstahl",
              "unit": "PIECE",
              "minQuantity": 5,
              "imageUrl": "https://example.com/a-1001.png"
            }
            """;

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProductService productService;

    // ---------- GET list ----------

    @Test
    void getAll_returns200WithArray() throws Exception {
        when(productService.getAll()).thenReturn(List.of(response(1L, "A-1001"), response(2L, "A-1002")));

        mockMvc.perform(get(BASE))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].sku").value("A-1001"))
                .andExpect(jsonPath("$[1].sku").value("A-1002"));
    }

    // ---------- GET detail ----------

    @Test
    void getById_returns200WithProduct() throws Exception {
        when(productService.getById(1L)).thenReturn(response(1L, "A-1001"));

        mockMvc.perform(get(BASE + "/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.sku").value("A-1001"))
                .andExpect(jsonPath("$.unit").value("PIECE"))
                .andExpect(jsonPath("$.quantity").value(3))
                .andExpect(jsonPath("$.minQuantity").value(5))
                .andExpect(jsonPath("$.lowStock").value(true))
                .andExpect(jsonPath("$.outOfStock").value(false));
    }

    @Test
    void getById_whenMissing_returns404() throws Exception {
        when(productService.getById(99L)).thenThrow(new NotFoundException("Artikel", 99L));

        mockMvc.perform(get(BASE + "/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Artikel mit ID 99 wurde nicht gefunden."));
    }

    // ---------- POST ----------

    @Test
    void create_returns201WithLocationAndCreatedProduct() throws Exception {
        when(productService.createProduct(any(ProductRequest.class))).thenReturn(response(1L, "A-1001"));

        mockMvc.perform(post(BASE).contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "http://localhost/api/v1/products/1"))
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.sku").value("A-1001"));

        verify(productService).createProduct(new ProductRequest(
                "A-1001", "Schraube M4", "Edelstahl", ProductUnit.PIECE, 5, "https://example.com/a-1001.png"));
    }

    @Test
    void create_whenRequiredFieldsMissing_returns400WithErrors() throws Exception {
        mockMvc.perform(post(BASE).contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.sku").exists())
                .andExpect(jsonPath("$.errors.name").exists())
                .andExpect(jsonPath("$.errors.unit").exists())
                .andExpect(jsonPath("$.errors.minQuantity").exists());

        verifyNoInteractions(productService);
    }

    @Test
    void create_whenValuesInvalid_returns400WithErrors() throws Exception {
        String body = """
                {
                  "sku": "A",
                  "name": "Sc",
                  "unit": "PIECE",
                  "minQuantity": -1,
                  "imageUrl": "not a url"
                }
                """;

        mockMvc.perform(post(BASE).contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.sku").exists())
                .andExpect(jsonPath("$.errors.name").exists())
                .andExpect(jsonPath("$.errors.minQuantity").exists())
                .andExpect(jsonPath("$.errors.imageUrl").exists());

        verifyNoInteractions(productService);
    }

    @Test
    void create_whenUnitUnknown_returns400() throws Exception {
        String body = VALID_BODY.replace("\"PIECE\"", "\"BARREL\"");

        mockMvc.perform(post(BASE).contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(productService);
    }

    @Test
    void create_whenJsonMalformed_returns400() throws Exception {
        mockMvc.perform(post(BASE).contentType(MediaType.APPLICATION_JSON).content("{not json"))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(productService);
    }

    @Test
    void create_whenSkuExists_returns409() throws Exception {
        when(productService.createProduct(any(ProductRequest.class)))
                .thenThrow(new DuplicateValueException("sku", "Die SKU „A-1001“ ist bereits vergeben."));

        mockMvc.perform(post(BASE).contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.errors.sku").value("Die SKU „A-1001“ ist bereits vergeben."));
    }

    // ---------- PUT ----------

    @Test
    void update_returns200WithUpdatedProduct() throws Exception {
        when(productService.updateProduct(any(ProductRequest.class), eq(1L))).thenReturn(response(1L, "A-1001"));

        mockMvc.perform(put(BASE + "/1").contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1));
    }

    @Test
    void update_whenInvalid_returns400() throws Exception {
        mockMvc.perform(put(BASE + "/1").contentType(MediaType.APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.sku").exists());

        verifyNoInteractions(productService);
    }

    @Test
    void update_whenMissing_returns404() throws Exception {
        when(productService.updateProduct(any(ProductRequest.class), eq(99L)))
                .thenThrow(new NotFoundException("Artikel", 99L));

        mockMvc.perform(put(BASE + "/99").contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
                .andExpect(status().isNotFound());
    }

    @Test
    void update_whenSkuTaken_returns409() throws Exception {
        when(productService.updateProduct(any(ProductRequest.class), eq(1L)))
                .thenThrow(new DuplicateValueException("sku", "Die SKU „A-1001“ ist bereits vergeben."));

        mockMvc.perform(put(BASE + "/1").contentType(MediaType.APPLICATION_JSON).content(VALID_BODY))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.errors.sku").value("Die SKU „A-1001“ ist bereits vergeben."));
    }

    // ---------- DELETE ----------

    @Test
    void delete_returns204() throws Exception {
        mockMvc.perform(delete(BASE + "/1"))
                .andExpect(status().isNoContent());

        verify(productService).deleteProduct(1L);
    }

    @Test
    void delete_whenMissing_returns404() throws Exception {
        doThrow(new NotFoundException("Artikel", 99L)).when(productService).deleteProduct(99L);

        mockMvc.perform(delete(BASE + "/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void delete_whenUsedInDocuments_returns409() throws Exception {
        doThrow(new EntityInUseException("Artikel", "Schraube M4", 3)).when(productService).deleteProduct(1L);

        mockMvc.perform(delete(BASE + "/1"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.detail").value("Artikel „Schraube M4“ wird in 3 Belegen verwendet."));
    }

    // ---------- helpers ----------

    private static ProductResponse response(Long id, String sku) {
        Instant now = Instant.parse("2026-11-18T10:00:00Z");
        return new ProductResponse(id, sku, "Schraube M4", "Edelstahl", ProductUnit.PIECE,
                3, 5, null, true, false, 0L, now, now);
    }
}
