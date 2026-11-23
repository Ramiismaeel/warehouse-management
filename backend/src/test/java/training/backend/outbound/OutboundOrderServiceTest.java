package training.backend.outbound;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.util.List;

import jakarta.persistence.EntityManager;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;

import training.backend.document.DocumentStatus;
import training.backend.exceptions.InsufficientStockException;
import training.backend.exceptions.InvalidStatusTransitionException;
import training.backend.exceptions.NotFoundException;
import training.backend.outbound.dto.OutboundOrderDetailResponse;
import training.backend.outbound.dto.OutboundOrderItemRequest;
import training.backend.outbound.dto.OutboundOrderRequest;
import training.backend.outbound.dto.OutboundOrderSummaryResponse;
import training.backend.product.ProductRepository;

/**
 * Integration tests for WM-31 / WM-32 against the real database (H2 in the default dev profile).
 * Every test runs in a transaction that is rolled back afterwards, so tests don't affect each other.
 * Because nothing is committed, tests call flush() where the SQL must really run against the database.
 */
@SpringBootTest
@Transactional
class OutboundOrderServiceTest {

    @Autowired
    private OutboundOrderService service;

    @Autowired
    private OutboundOrderRepository repository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private EntityManager entityManager;

    private Long schraube;
    private Long mutter;
    private Long mueller;
    private Long schmidt;

    @BeforeEach
    void setUp() {
        schraube = createProduct("TEST-0001", 10);
        mutter = createProduct("TEST-0002", 5);
        mueller = createCustomer("Test Müller Bau GmbH");
        schmidt = createCustomer("Test Schmidt AG");
    }

    // ---------- create ----------

    @Test
    void create_returnsDraftWithNumberCustomerAndItems() {
        OutboundOrderDetailResponse created = service.create(request(mueller,
                new OutboundOrderItemRequest(schraube, 4),
                new OutboundOrderItemRequest(mutter, 2)));

        assertEquals(DocumentStatus.DRAFT, created.status());
        assertTrue(created.number().matches("WA-\\d{4}-\\d{4,}"), "unexpected number: " + created.number());
        assertEquals("Test Müller Bau GmbH", created.customerName());
        assertEquals(mueller, created.customer().id());
        assertEquals(2, created.itemCount());
        assertEquals(6, created.totalQuantity());
        assertTrue(created.items().stream().anyMatch(i -> "TEST-0001".equals(i.sku()) && i.quantity() == 4));
    }

    @Test
    void create_doesNotChangeStock() {
        service.create(request(mueller, new OutboundOrderItemRequest(schraube, 4)));

        assertEquals(10, quantityOf(schraube));
    }

    @Test
    void create_mergesDuplicateProducts() {
        OutboundOrderDetailResponse created = service.create(request(mueller,
                new OutboundOrderItemRequest(schraube, 3),
                new OutboundOrderItemRequest(schraube, 4)));

        assertEquals(1, created.itemCount());
        assertEquals(7, created.items().getFirst().quantity());
    }

    @Test
    void create_withoutDate_usesToday() {
        OutboundOrderDetailResponse created = service.create(new OutboundOrderRequest(
                mueller, null, null, List.of(new OutboundOrderItemRequest(schraube, 1))));

        assertEquals(LocalDate.now(), created.orderDate());
    }

    @Test
    void create_withUnknownCustomer_throwsNotFoundAndSavesNothing() {
        long before = repository.count();

        NotFoundException ex = assertThrows(NotFoundException.class, () ->
                service.create(request(999_999L, new OutboundOrderItemRequest(schraube, 1))));

        assertEquals("Kunde mit ID 999999 wurde nicht gefunden.", ex.getMessage());
        assertEquals(before, repository.count());
    }

    @Test
    void create_withUnknownProduct_throwsNotFound() {
        assertThrows(NotFoundException.class, () ->
                service.create(request(mueller, new OutboundOrderItemRequest(999_999L, 1))));
    }

    // ---------- update ----------

    @Test
    void update_draft_replacesHeaderAndItems() {
        OutboundOrderDetailResponse created = service.create(request(mueller,
                new OutboundOrderItemRequest(schraube, 5),
                new OutboundOrderItemRequest(mutter, 2)));

        service.update(created.id(), request(schmidt, new OutboundOrderItemRequest(schraube, 8)));
        repository.flush();          // runs the INSERT: fails here if the unique constraint is hit
        entityManager.clear();

        OutboundOrderDetailResponse reloaded = service.getById(created.id());
        assertEquals("Test Schmidt AG", reloaded.customerName());
        assertEquals(1, reloaded.itemCount());
        assertEquals(8, reloaded.totalQuantity());
        assertEquals(created.number(), reloaded.number());
        assertEquals(DocumentStatus.DRAFT, reloaded.status());
    }

    @Test
    void update_whenConfirmed_rejectsAndChangesNothing() {
        OutboundOrderDetailResponse created = service.create(request(mueller, new OutboundOrderItemRequest(schraube, 5)));
        confirm(created.id());

        InvalidStatusTransitionException ex = assertThrows(InvalidStatusTransitionException.class, () ->
                service.update(created.id(), request(schmidt, new OutboundOrderItemRequest(mutter, 1))));

        assertEquals("„Bearbeiten“ ist im Status „Bestätigt“ nicht möglich.", ex.getMessage());
        entityManager.clear();
        OutboundOrderDetailResponse reloaded = service.getById(created.id());
        assertEquals("Test Müller Bau GmbH", reloaded.customerName());
        assertEquals("TEST-0001", reloaded.items().getFirst().sku());
    }

    // ---------- delete ----------

    @Test
    void delete_draft_removesOrderAndItems() {
        OutboundOrderDetailResponse created = service.create(request(mueller, new OutboundOrderItemRequest(schraube, 5)));

        service.delete(created.id());
        repository.flush();

        assertFalse(repository.existsById(created.id()));
        Integer itemRows = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM outbound_order_item WHERE outbound_order_id = ?",
                Integer.class, created.id());
        assertEquals(0, itemRows);
    }

    @Test
    void delete_whenConfirmed_rejects() {
        OutboundOrderDetailResponse created = service.create(request(mueller, new OutboundOrderItemRequest(schraube, 5)));
        confirm(created.id());

        assertThrows(InvalidStatusTransitionException.class, () -> service.delete(created.id()));
        assertTrue(repository.existsById(created.id()));
    }

    @Test
    void delete_whenCancelled_rejects() {
        OutboundOrderDetailResponse created = service.create(request(mueller, new OutboundOrderItemRequest(schraube, 5)));
        confirm(created.id());
        service.cancel(created.id());

        assertThrows(InvalidStatusTransitionException.class, () -> service.delete(created.id()));
        assertTrue(repository.existsById(created.id()));
    }

    // ---------- confirm ----------

    @Test
    void confirm_decreasesStockAndSetsConfirmed() {
        OutboundOrderDetailResponse created = service.create(request(mueller,
                new OutboundOrderItemRequest(schraube, 4),
                new OutboundOrderItemRequest(mutter, 5)));

        OutboundOrderDetailResponse confirmed = service.confirm(created.id());

        assertEquals(DocumentStatus.CONFIRMED, confirmed.status());
        assertEquals(6, quantityOf(schraube));
        assertEquals(0, quantityOf(mutter));   // exactly the available stock is allowed
    }

    @Test
    void confirm_whenStockInsufficient_rejectsAndChangesNothing() {
        OutboundOrderDetailResponse created = service.create(request(mueller,
                new OutboundOrderItemRequest(schraube, 4),    // enough on its own (10)
                new OutboundOrderItemRequest(mutter, 8)));    // only 5 available

        InsufficientStockException ex = assertThrows(InsufficientStockException.class,
                () -> service.confirm(created.id()));

        assertEquals(1, ex.getShortages().size());
        InsufficientStockException.Shortage shortage = ex.getShortages().getFirst();
        assertEquals(mutter, shortage.productId());
        assertEquals("TEST-0002", shortage.sku());
        assertEquals(8, shortage.requested());
        assertEquals(5, shortage.available());

        assertEquals(10, quantityOf(schraube));  // untouched although it had enough (all-or-nothing)
        assertEquals(5, quantityOf(mutter));
        assertEquals(DocumentStatus.DRAFT, service.getById(created.id()).status());
    }

    @Test
    void confirm_whenSeveralShortages_listsAll() {
        OutboundOrderDetailResponse created = service.create(request(mueller,
                new OutboundOrderItemRequest(schraube, 11),
                new OutboundOrderItemRequest(mutter, 6)));

        InsufficientStockException ex = assertThrows(InsufficientStockException.class,
                () -> service.confirm(created.id()));

        assertEquals(2, ex.getShortages().size());
    }

    @Test
    void confirm_twice_rejectsAndChangesStockOnlyOnce() {
        OutboundOrderDetailResponse created = service.create(request(mueller, new OutboundOrderItemRequest(schraube, 4)));
        service.confirm(created.id());

        assertThrows(InvalidStatusTransitionException.class, () -> service.confirm(created.id()));

        assertEquals(6, quantityOf(schraube));
        assertEquals(DocumentStatus.CONFIRMED, service.getById(created.id()).status());
    }

    @Test
    void confirm_whenUnknownId_throwsNotFound() {
        assertThrows(NotFoundException.class, () -> service.confirm(999_999L));
    }

    // ---------- cancel ----------

    @Test
    void cancel_restoresStockAndSetsCancelled() {
        OutboundOrderDetailResponse created = service.create(request(mueller,
                new OutboundOrderItemRequest(schraube, 4),
                new OutboundOrderItemRequest(mutter, 5)));
        service.confirm(created.id());

        OutboundOrderDetailResponse cancelled = service.cancel(created.id());

        assertEquals(DocumentStatus.CANCELLED, cancelled.status());
        assertEquals(10, quantityOf(schraube));
        assertEquals(5, quantityOf(mutter));
    }

    @Test
    void cancel_whenDraft_rejectsAndChangesNothing() {
        OutboundOrderDetailResponse created = service.create(request(mueller, new OutboundOrderItemRequest(schraube, 4)));

        assertThrows(InvalidStatusTransitionException.class, () -> service.cancel(created.id()));

        assertEquals(10, quantityOf(schraube));
        assertEquals(DocumentStatus.DRAFT, service.getById(created.id()).status());
    }

    @Test
    void cancel_whenAlreadyCancelled_rejects() {
        OutboundOrderDetailResponse created = service.create(request(mueller, new OutboundOrderItemRequest(schraube, 4)));
        service.confirm(created.id());
        service.cancel(created.id());

        assertThrows(InvalidStatusTransitionException.class, () -> service.cancel(created.id()));
        assertThrows(InvalidStatusTransitionException.class, () -> service.confirm(created.id()));

        assertEquals(10, quantityOf(schraube));
    }

    // ---------- list / detail ----------

    @Test
    void getAll_filtersByStatus() {
        Long draftId = service.create(request(mueller, new OutboundOrderItemRequest(schraube, 1))).id();
        Long confirmedId = service.create(request(schmidt, new OutboundOrderItemRequest(mutter, 1))).id();
        confirm(confirmedId);

        List<OutboundOrderSummaryResponse> drafts = service.getAll(DocumentStatus.DRAFT);
        assertTrue(drafts.stream().anyMatch(o -> o.id().equals(draftId)));
        assertFalse(drafts.stream().anyMatch(o -> o.id().equals(confirmedId)));
        assertTrue(drafts.stream().allMatch(o -> o.status() == DocumentStatus.DRAFT));

        List<OutboundOrderSummaryResponse> all = service.getAll(null);
        OutboundOrderSummaryResponse confirmed = all.stream()
                .filter(o -> o.id().equals(confirmedId)).findFirst().orElseThrow();
        assertEquals("Test Schmidt AG", confirmed.customerName());
        assertEquals(1, confirmed.itemCount());
        assertTrue(all.stream().anyMatch(o -> o.id().equals(draftId)));
    }

    @Test
    void getById_whenUnknownId_throwsNotFound() {
        assertThrows(NotFoundException.class, () -> service.getById(999_999L));
    }

    // ---------- helpers ----------

    private OutboundOrderRequest request(Long customerId, OutboundOrderItemRequest... items) {
        return new OutboundOrderRequest(customerId, LocalDate.of(2026, 11, 20), "Test", List.of(items));
    }

    /** Inserts a product with plain SQL, so the test doesn't depend on ProductService's API. */
    private Long createProduct(String sku, int quantity) {
        jdbcTemplate.update("""
                INSERT INTO product (sku, name, unit, quantity, min_quantity, version, created_at, updated_at)
                VALUES (?, ?, 'PIECE', ?, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                """, sku, "Test " + sku, quantity);
        return jdbcTemplate.queryForObject("SELECT id FROM product WHERE sku = ?", Long.class, sku);
    }

    private Long createCustomer(String name) {
        jdbcTemplate.update("""
                INSERT INTO customer (name, created_at, updated_at)
                VALUES (?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                """, name);
        return jdbcTemplate.queryForObject("SELECT id FROM customer WHERE name = ?", Long.class, name);
    }

    private void confirm(Long id) {
        service.confirm(id);
        repository.flush();
    }

    /** Flushes pending changes, then reads the quantity fresh from the database. */
    private int quantityOf(Long productId) {
        repository.flush();
        entityManager.clear();
        return productRepository.findById(productId).orElseThrow().getQuantity();
    }
}
