package training.backend.product;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.util.ReflectionTestUtils;
import training.backend.exceptions.DuplicateValueException;
import training.backend.exceptions.EntityInUseException;
import training.backend.exceptions.NotFoundException;
import training.backend.product.dto.ProductRequest;
import training.backend.product.dto.ProductResponse;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** Unit tests for ProductService. Uses the real MapStruct mapper so the mapping is covered too. */
@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    private ProductService productService;

    @BeforeEach
    void setUp() {
        productService = new ProductService(productRepository, new ProductMapperImpl());
    }

    // ---------- getAll ----------

    @Test
    void getAll_withoutSearchTerm_returnsAllProductsSortedBySku() {
        when(productRepository.findAllByOrderBySkuAsc()).thenReturn(List.of(
                product(1L, "A-1001", "Schraube M4", 10, 5),
                product(2L, "A-1002", "Mutter M4", 0, 5)));

        List<ProductResponse> result = productService.getAll(null);

        assertThat(result).extracting(ProductResponse::sku).containsExactly("A-1001", "A-1002");
        verify(productRepository, never()).search(anyString());
    }

    @Test
    void getAll_withBlankSearchTerm_returnsAll() {
        when(productRepository.findAllByOrderBySkuAsc()).thenReturn(List.of(product(1L, "A-1001", "Schraube M4", 10, 5)));

        assertThat(productService.getAll("   ")).hasSize(1);
        verify(productRepository, never()).search(anyString());
    }

    @Test
    void getAll_whenNoProducts_returnsEmptyList() {
        when(productRepository.findAllByOrderBySkuAsc()).thenReturn(List.of());

        assertThat(productService.getAll(null)).isEmpty();
    }

    @Test
    void getAll_withSearchTerm_searchesWithTrimmedTerm() {
        when(productRepository.search("schraube")).thenReturn(List.of(product(1L, "A-1001", "Schraube M4", 10, 5)));

        List<ProductResponse> result = productService.getAll("  schraube  ");

        assertThat(result).extracting(ProductResponse::sku).containsExactly("A-1001");
        verify(productRepository, never()).findAllByOrderBySkuAsc();
    }

    @Test
    void getAll_withLikeWildcardsInSearchTerm_escapesThem() {
        // Input: 50% m_4 a\b  ->  escaped: 50\% m\_4 a\\b
        when(productRepository.search("50\\% m\\_4 a\\\\b")).thenReturn(List.of(product(1L, "A-1001", "50% m_4 a\\b", 10, 5)));

        assertThat(productService.getAll("50% m_4 a\\b")).hasSize(1);
    }

    // ---------- getById ----------

    @Test
    void getById_whenFound_returnsMappedProduct() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product(1L, "A-1001", "Schraube M4", 10, 5)));

        ProductResponse result = productService.getById(1L);

        assertThat(result.id()).isEqualTo(1L);
        assertThat(result.sku()).isEqualTo("A-1001");
        assertThat(result.name()).isEqualTo("Schraube M4");
        assertThat(result.quantity()).isEqualTo(10);
        assertThat(result.minQuantity()).isEqualTo(5);
    }

    @Test
    void getById_whenMissing_throwsNotFound() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.getById(99L))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Artikel mit ID 99 wurde nicht gefunden.");
    }

    @Test
    void getById_whenQuantityAboveMin_isNotLowStock() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product(1L, "A-1001", "Schraube M4", 6, 5)));

        ProductResponse result = productService.getById(1L);

        assertThat(result.lowStock()).isFalse();
        assertThat(result.outOfStock()).isFalse();
    }

    @Test
    void getById_whenQuantityEqualsMin_isLowStock() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product(1L, "A-1001", "Schraube M4", 5, 5)));

        ProductResponse result = productService.getById(1L);

        assertThat(result.lowStock()).isTrue();
        assertThat(result.outOfStock()).isFalse();
    }

    @Test
    void getById_whenQuantityZero_isLowAndOutOfStock() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product(1L, "A-1001", "Schraube M4", 0, 5)));

        ProductResponse result = productService.getById(1L);

        assertThat(result.lowStock()).isTrue();
        assertThat(result.outOfStock()).isTrue();
    }

    // ---------- createProduct ----------

    @Test
    void createProduct_normalizesSkuAndStartsWithQuantityZero() {
        when(productRepository.existsBySku("A-1001")).thenReturn(false);
        when(productRepository.saveAndFlush(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProductResponse result = productService.createProduct(request("  a-1001 ", "Schraube M4", 5));

        ArgumentCaptor<Product> saved = ArgumentCaptor.forClass(Product.class);
        verify(productRepository).saveAndFlush(saved.capture());
        assertThat(saved.getValue().getSku()).isEqualTo("A-1001");
        assertThat(saved.getValue().getName()).isEqualTo("Schraube M4");
        assertThat(saved.getValue().getUnit()).isEqualTo(ProductUnit.PIECE);
        assertThat(saved.getValue().getMinQuantity()).isEqualTo(5);
        assertThat(saved.getValue().getQuantity()).isZero();
        assertThat(result.sku()).isEqualTo("A-1001");
        assertThat(result.quantity()).isZero();
    }

    @Test
    void createProduct_whenSkuExists_throwsDuplicateAndSavesNothing() {
        when(productRepository.existsBySku("A-1001")).thenReturn(true);

        assertThatThrownBy(() -> productService.createProduct(request(" a-1001", "Schraube M4", 5)))
                .isInstanceOf(DuplicateValueException.class)
                .hasMessage("Die SKU „A-1001“ ist bereits vergeben.")
                .extracting("field").isEqualTo("sku");

        verify(productRepository, never()).saveAndFlush(any());
    }

    @Test
    void createProduct_whenParallelInsertTakesSku_throwsDuplicate() {
        // Both requests passed existsBySku; the unique constraint rejects the second insert.
        when(productRepository.existsBySku("A-1001")).thenReturn(false);
        when(productRepository.saveAndFlush(any(Product.class)))
                .thenThrow(new DataIntegrityViolationException("unique constraint on sku"));

        assertThatThrownBy(() -> productService.createProduct(request("a-1001", "Schraube M4", 5)))
                .isInstanceOf(DuplicateValueException.class)
                .hasMessage("Die SKU „A-1001“ ist bereits vergeben.")
                .extracting("field").isEqualTo("sku");
    }

    // ---------- updateProduct ----------

    @Test
    void updateProduct_updatesFieldsAndKeepsQuantity() {
        Product existing = product(1L, "A-1001", "Schraube M4", 42, 5);
        when(productRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(productRepository.existsBySkuAndIdNot("A-2002", 1L)).thenReturn(false);
        when(productRepository.saveAndFlush(existing)).thenReturn(existing);

        ProductResponse result = productService.updateProduct(request(" a-2002", "Schraube M5", 8), 1L);

        assertThat(existing.getSku()).isEqualTo("A-2002");
        assertThat(existing.getName()).isEqualTo("Schraube M5");
        assertThat(existing.getMinQuantity()).isEqualTo(8);
        assertThat(existing.getQuantity()).isEqualTo(42); // rule 1: update never touches stock
        assertThat(existing.getId()).isEqualTo(1L);
        assertThat(result.sku()).isEqualTo("A-2002");
        assertThat(result.quantity()).isEqualTo(42);
    }

    @Test
    void updateProduct_whenMissing_throwsNotFound() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.updateProduct(request("A-1001", "Schraube M4", 5), 99L))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Artikel mit ID 99 wurde nicht gefunden.");

        verify(productRepository, never()).saveAndFlush(any());
    }

    @Test
    void updateProduct_whenSkuTakenByOtherProduct_throwsDuplicateAndChangesNothing() {
        Product existing = product(1L, "A-1001", "Schraube M4", 10, 5);
        when(productRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(productRepository.existsBySkuAndIdNot("A-2002", 1L)).thenReturn(true);

        assertThatThrownBy(() -> productService.updateProduct(request("a-2002", "Schraube M5", 8), 1L))
                .isInstanceOf(DuplicateValueException.class)
                .hasMessage("Die SKU „A-2002“ ist bereits vergeben.")
                .extracting("field").isEqualTo("sku");

        assertThat(existing.getSku()).isEqualTo("A-1001");
        assertThat(existing.getName()).isEqualTo("Schraube M4");
        verify(productRepository, never()).saveAndFlush(any());
    }

    @Test
    void updateProduct_whenParallelUpdateTakesSku_throwsDuplicate() {
        Product existing = product(1L, "A-1001", "Schraube M4", 10, 5);
        when(productRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(productRepository.existsBySkuAndIdNot("A-2002", 1L)).thenReturn(false);
        when(productRepository.saveAndFlush(existing))
                .thenThrow(new DataIntegrityViolationException("unique constraint on sku"));

        assertThatThrownBy(() -> productService.updateProduct(request("a-2002", "Schraube M5", 8), 1L))
                .isInstanceOf(DuplicateValueException.class)
                .hasMessage("Die SKU „A-2002“ ist bereits vergeben.")
                .extracting("field").isEqualTo("sku");
    }

    // ---------- deleteProduct ----------

    @Test
    void deleteProduct_whenNotUsedInAnyDocument_deletesIt() {
        Product existing = product(1L, "A-1001", "Schraube M4", 10, 5);
        when(productRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(productRepository.countInboundDeliveryUsages(1L)).thenReturn(0L);
        when(productRepository.countOutboundOrderUsages(1L)).thenReturn(0L);

        productService.deleteProduct(1L);

        verify(productRepository).delete(existing);
    }

    @Test
    void deleteProduct_whenUsedInDocuments_throwsInUseAndDeletesNothing() {
        Product existing = product(1L, "A-1001", "Schraube M4", 10, 5);
        when(productRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(productRepository.countInboundDeliveryUsages(1L)).thenReturn(2L);
        when(productRepository.countOutboundOrderUsages(1L)).thenReturn(1L);

        assertThatThrownBy(() -> productService.deleteProduct(1L))
                .isInstanceOf(EntityInUseException.class)
                .hasMessage("Artikel „Schraube M4“ wird in 3 Belegen verwendet.");

        verify(productRepository, never()).delete(any());
    }

    @Test
    void deleteProduct_whenUsedInOnlyOneOutboundOrder_throwsInUse() {
        Product existing = product(1L, "A-1001", "Schraube M4", 10, 5);
        when(productRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(productRepository.countInboundDeliveryUsages(1L)).thenReturn(0L);
        when(productRepository.countOutboundOrderUsages(1L)).thenReturn(1L);

        assertThatThrownBy(() -> productService.deleteProduct(1L))
                .isInstanceOf(EntityInUseException.class)
                .hasMessage("Artikel „Schraube M4“ wird in 1 Beleg verwendet.");

        verify(productRepository, never()).delete(any());
    }

    @Test
    void deleteProduct_whenMissing_throwsNotFoundAndDeletesNothing() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.deleteProduct(99L))
                .isInstanceOf(NotFoundException.class);

        verify(productRepository, never()).delete(any());
    }

    // ---------- helpers ----------

    private static ProductRequest request(String sku, String name, int minQuantity) {
        return new ProductRequest(sku, name, "Beschreibung", ProductUnit.PIECE, minQuantity, null);
    }

    /** Builds a product as if loaded from the DB. id and quantity have no setters, so they are set via reflection. */
    private static Product product(Long id, String sku, String name, int quantity, int minQuantity) {
        Product product = new Product();
        ReflectionTestUtils.setField(product, "id", id);
        ReflectionTestUtils.setField(product, "quantity", quantity);
        product.setSku(sku);
        product.setName(name);
        product.setUnit(ProductUnit.PIECE);
        product.setMinQuantity(minQuantity);
        return product;
    }
}
