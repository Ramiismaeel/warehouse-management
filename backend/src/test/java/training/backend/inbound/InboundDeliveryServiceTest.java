package training.backend.inbound;

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
import training.backend.inbound.dto.InboundDeliveryItemRequest;
import training.backend.inbound.dto.InboundDeliveryDetailResponse;
import training.backend.inbound.dto.InboundDeliveryRequest;
import training.backend.inbound.dto.InboundDeliverySummaryResponse;
import training.backend.product.ProductRepository;
import training.backend.stock.StockChange;
import training.backend.stock.StockDirection;
import training.backend.stock.StockService;

/**
 * Integration tests for WM-27 / WM-28 against the real database (H2 in the default dev profile).
 * Every test runs in a transaction that is rolled back afterwards, so tests don't affect each other.
 * Because nothing is committed, tests call flush() where the SQL must really run against the database.
 */
@SpringBootTest
@Transactional
class InboundDeliveryServiceTest {

    @Autowired
    private InboundDeliveryService service;

    @Autowired
    private InboundDeliveryRepository repository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private StockService stockService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private EntityManager entityManager;

    private Long schraube;
    private Long mutter;

    @BeforeEach
    void setUp() {
        schraube = createProduct("TEST-0001", 10);
        mutter = createProduct("TEST-0002", 5);
    }

    // ---------- create ----------

    @Test
    void createReturnsDraftWithNumberAndItems() {
        InboundDeliveryDetailResponse created = service.create(request("Müller GmbH",
                new InboundDeliveryItemRequest(schraube, 20),
                new InboundDeliveryItemRequest(mutter, 5)));

        assertEquals(DocumentStatus.DRAFT, created.status());
        assertTrue(created.number().matches("WE-\\d{4}-\\d{4,}"), "unexpected number: " + created.number());
        assertEquals(2, created.itemCount());
        assertEquals(25, created.totalQuantity());
        assertTrue(created.items().stream().anyMatch(i -> "TEST-0001".equals(i.sku()) && i.quantity() == 20));
    }

    @Test
    void createDoesNotChangeStock() {
        service.create(request("Müller GmbH", new InboundDeliveryItemRequest(schraube, 20)));
        repository.flush();

        assertEquals(10, quantityOf(schraube));
    }

    @Test
    void createMergesDuplicateProducts() {
        InboundDeliveryDetailResponse created = service.create(request("Müller GmbH",
                new InboundDeliveryItemRequest(schraube, 3),
                new InboundDeliveryItemRequest(schraube, 4)));

        assertEquals(1, created.itemCount());
        assertEquals(7, created.items().getFirst().quantity());
    }

    @Test
    void createWithUnknownProductThrowsNotFound() {
        assertThrows(NotFoundException.class, () ->
                service.create(request("Müller GmbH", new InboundDeliveryItemRequest(999_999L, 1))));
    }

    // Remove this test if your team keeps @NotNull on deliveryDate in the request.
    @Test
    void createWithoutDateUsesToday() {
        InboundDeliveryDetailResponse created = service.create(new InboundDeliveryRequest(
                "Müller GmbH", null, null, List.of(new InboundDeliveryItemRequest(schraube, 1))));

        assertEquals(LocalDate.now(), created.deliveryDate());
    }

    // ---------- update ----------

    @Test
    void updateDraftReplacesItemsEvenWhenKeepingSameProduct() {
        InboundDeliveryDetailResponse created = service.create(request("Müller GmbH",
                new InboundDeliveryItemRequest(schraube, 5),
                new InboundDeliveryItemRequest(mutter, 2)));

        service.update(created.id(), request("Schmidt AG", new InboundDeliveryItemRequest(schraube, 8)));
        repository.flush();          // runs the INSERT: fails here if the unique constraint is hit
        entityManager.clear();       // forget cached entities, read fresh from the database

        InboundDeliveryDetailResponse reloaded = service.getById(created.id());
        assertEquals("Schmidt AG", reloaded.supplierName());
        assertEquals(1, reloaded.itemCount());
        assertEquals(8, reloaded.totalQuantity());
        assertEquals(created.number(), reloaded.number());
        assertEquals(DocumentStatus.DRAFT, reloaded.status());
    }

    @Test
    void updateConfirmedIsRejectedAndChangesNothing() {
        InboundDeliveryDetailResponse created = service.create(request("Müller GmbH", new InboundDeliveryItemRequest(schraube, 5)));
        confirm(created.id());

        assertThrows(InvalidStatusTransitionException.class, () ->
                service.update(created.id(), request("Schmidt AG", new InboundDeliveryItemRequest(mutter, 1))));

        entityManager.clear();
        InboundDeliveryDetailResponse reloaded = service.getById(created.id());
        assertEquals("Müller GmbH", reloaded.supplierName());
        assertEquals("TEST-0001", reloaded.items().getFirst().sku());
    }

    @Test
    void update_whenCancelled_rejectsAndChangesNothing() {
        InboundDeliveryDetailResponse created = service.create(request("Müller GmbH", new InboundDeliveryItemRequest(schraube, 5)));
        confirm(created.id());
        service.cancel(created.id());
        repository.flush();

        InvalidStatusTransitionException ex = assertThrows(InvalidStatusTransitionException.class, () ->
                service.update(created.id(), request("Schmidt AG", new InboundDeliveryItemRequest(mutter, 1))));

        assertEquals("„Bearbeiten“ ist im Status „Storniert“ nicht möglich.", ex.getMessage());
        entityManager.clear();
        InboundDeliveryDetailResponse reloaded = service.getById(created.id());
        assertEquals("Müller GmbH", reloaded.supplierName());
        assertEquals("TEST-0001", reloaded.items().getFirst().sku());
        assertEquals(DocumentStatus.CANCELLED, reloaded.status());
    }

    // ---------- delete ----------

    @Test
    void deleteDraftRemovesDeliveryAndItems() {
        InboundDeliveryDetailResponse created = service.create(request("Müller GmbH", new InboundDeliveryItemRequest(schraube, 5)));

        service.delete(created.id());
        repository.flush();

        assertFalse(repository.existsById(created.id()));
        Integer itemRows = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM inbound_delivery_item WHERE inbound_delivery_id = ?",
                Integer.class, created.id());
        assertEquals(0, itemRows);
    }

    @Test
    void deleteConfirmedIsRejected() {
        InboundDeliveryDetailResponse created = service.create(request("Müller GmbH", new InboundDeliveryItemRequest(schraube, 5)));
        confirm(created.id());

        assertThrows(InvalidStatusTransitionException.class, () -> service.delete(created.id()));
        assertTrue(repository.existsById(created.id()));
    }

    @Test
    void delete_whenCancelled_rejects() {
        InboundDeliveryDetailResponse created = service.create(request("Müller GmbH", new InboundDeliveryItemRequest(schraube, 5)));
        confirm(created.id());
        service.cancel(created.id());

        InvalidStatusTransitionException ex = assertThrows(InvalidStatusTransitionException.class,
                () -> service.delete(created.id()));

        assertEquals("„Löschen“ ist im Status „Storniert“ nicht möglich.", ex.getMessage());
        assertTrue(repository.existsById(created.id()));
    }

    @Test
    void delete_whenUnknownId_throwsNotFound() {
        assertThrows(NotFoundException.class, () -> service.delete(999_999L));
    }

    // ---------- confirm ----------

    @Test
    void confirm_increasesStockAndSetsConfirmed() {
        InboundDeliveryDetailResponse created = service.create(request("Müller GmbH",
                new InboundDeliveryItemRequest(schraube, 20),
                new InboundDeliveryItemRequest(mutter, 3)));

        InboundDeliveryDetailResponse confirmed = service.confirm(created.id());

        assertEquals(DocumentStatus.CONFIRMED, confirmed.status());
        assertEquals(30, quantityOf(schraube));
        assertEquals(8, quantityOf(mutter));
    }

    @Test
    void confirm_twice_rejectsAndChangesStockOnlyOnce() {
        InboundDeliveryDetailResponse created = service.create(request("Müller GmbH", new InboundDeliveryItemRequest(schraube, 20)));
        service.confirm(created.id());

        assertThrows(InvalidStatusTransitionException.class, () -> service.confirm(created.id()));

        assertEquals(30, quantityOf(schraube));
        assertEquals(DocumentStatus.CONFIRMED, service.getById(created.id()).status());
    }

    @Test
    void confirm_whenUnknownId_throwsNotFound() {
        assertThrows(NotFoundException.class, () -> service.confirm(999_999L));
    }

    // ---------- cancel ----------

    @Test
    void cancel_decreasesStockAndSetsCancelled() {
        InboundDeliveryDetailResponse created = service.create(request("Müller GmbH",
                new InboundDeliveryItemRequest(schraube, 20),
                new InboundDeliveryItemRequest(mutter, 3)));
        service.confirm(created.id());

        InboundDeliveryDetailResponse cancelled = service.cancel(created.id());

        assertEquals(DocumentStatus.CANCELLED, cancelled.status());
        assertEquals(10, quantityOf(schraube));
        assertEquals(5, quantityOf(mutter));
    }

    @Test
    void cancel_whenStockAlreadyShipped_rejectsAndChangesNothing() {
        InboundDeliveryDetailResponse created = service.create(request("Müller GmbH",
                new InboundDeliveryItemRequest(schraube, 20),   // 10 -> 30, then 25 shipped -> 5 left, cancel needs 20
                new InboundDeliveryItemRequest(mutter, 3)));    // 5 -> 8, enough to cancel on its own
        service.confirm(created.id());
        stockService.apply(List.of(new StockChange(schraube, 25)), StockDirection.OUT);

        InsufficientStockException ex = assertThrows(InsufficientStockException.class,
                () -> service.cancel(created.id()));

        assertEquals(1, ex.getShortages().size());
        InsufficientStockException.Shortage shortage = ex.getShortages().getFirst();
        assertEquals(schraube, shortage.productId());
        assertEquals("TEST-0001", shortage.sku());
        assertEquals(20, shortage.requested());
        assertEquals(5, shortage.available());

        assertEquals(5, quantityOf(schraube));
        assertEquals(8, quantityOf(mutter));     // untouched although it had enough (all-or-nothing)
        assertEquals(DocumentStatus.CONFIRMED, service.getById(created.id()).status());
    }

    @Test
    void cancel_whenDraft_rejectsAndChangesNothing() {
        InboundDeliveryDetailResponse created = service.create(request("Müller GmbH", new InboundDeliveryItemRequest(schraube, 5)));

        assertThrows(InvalidStatusTransitionException.class, () -> service.cancel(created.id()));

        assertEquals(10, quantityOf(schraube));
        assertEquals(DocumentStatus.DRAFT, service.getById(created.id()).status());
    }

    @Test
    void cancel_whenAlreadyCancelled_rejects() {
        InboundDeliveryDetailResponse created = service.create(request("Müller GmbH", new InboundDeliveryItemRequest(schraube, 5)));
        service.confirm(created.id());
        service.cancel(created.id());

        assertThrows(InvalidStatusTransitionException.class, () -> service.cancel(created.id()));
        assertThrows(InvalidStatusTransitionException.class, () -> service.confirm(created.id()));

        assertEquals(10, quantityOf(schraube));
    }

    // ---------- list / detail ----------

    @Test
    void getAllFiltersByStatus() {
        Long draftId = service.create(request("Müller GmbH", new InboundDeliveryItemRequest(schraube, 1))).id();
        Long confirmedId = service.create(request("Schmidt AG", new InboundDeliveryItemRequest(mutter, 1))).id();
        confirm(confirmedId);

        List<InboundDeliverySummaryResponse> drafts = service.getAll(DocumentStatus.DRAFT);
        assertTrue(drafts.stream().anyMatch(d -> d.id().equals(draftId)));
        assertFalse(drafts.stream().anyMatch(d -> d.id().equals(confirmedId)));
        assertTrue(drafts.stream().allMatch(d -> d.status() == DocumentStatus.DRAFT));

        List<InboundDeliverySummaryResponse> all = service.getAll(null);
        assertTrue(all.stream().anyMatch(d -> d.id().equals(draftId)));
        assertTrue(all.stream().anyMatch(d -> d.id().equals(confirmedId)));
    }

    @Test
    void getByIdWithUnknownIdThrowsNotFound() {
        assertThrows(NotFoundException.class, () -> service.getById(999_999L));
    }

    // ---------- helpers ----------

    private InboundDeliveryRequest request(String supplier, InboundDeliveryItemRequest... items) {
        return new InboundDeliveryRequest(supplier, LocalDate.of(2026, 11, 20), "Test", List.of(items));
    }

    /** Inserts a product with plain SQL, so the test doesn't depend on ProductService's API. */
    private Long createProduct(String sku, int quantity) {
        jdbcTemplate.update("""
                INSERT INTO product (sku, name, unit, quantity, min_quantity, version, created_at, updated_at)
                VALUES (?, ?, 'PIECE', ?, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                """, sku, "Test " + sku, quantity);
        return jdbcTemplate.queryForObject("SELECT id FROM product WHERE sku = ?", Long.class, sku);
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