package training.backend.stock;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.List;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;

import training.backend.product.ProductRepository;

/**
 * Business rule 10: two requests change the same product's stock at once. The one that read the older
 * {@code @Version} must fail (GlobalExceptionHandler turns that into 409), and only the other change counts.
 * NOT @Transactional on purpose: the parallel change must really commit. The test product is deleted afterwards.
 */
@SpringBootTest
class StockServiceOptimisticLockTest {

    private static final String SKU = "TEST-OPTLOCK";

    @Autowired
    private StockService stockService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PlatformTransactionManager transactionManager;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private Long productId;

    @BeforeEach
    void setUp() {
        jdbcTemplate.update("""
                INSERT INTO product (sku, name, unit, quantity, min_quantity, version, created_at, updated_at)
                VALUES (?, 'Test Optimistic Lock', 'PIECE', 10, 0, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                """, SKU);
        productId = jdbcTemplate.queryForObject("SELECT id FROM product WHERE sku = ?", Long.class, SKU);
    }

    @AfterEach
    void cleanUp() {
        jdbcTemplate.update("DELETE FROM product WHERE sku = ?", SKU);
    }

    @Test
    void apply_whenProductChangedByParallelTransaction_rejectsStaleChange() {
        TransactionTemplate requestA = new TransactionTemplate(transactionManager);
        TransactionTemplate requestB = new TransactionTemplate(transactionManager);
        requestB.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);

        assertThrows(OptimisticLockingFailureException.class, () -> requestA.executeWithoutResult(statusA -> {
            productRepository.findById(productId).orElseThrow();              // A reads quantity 10, version 0
            requestB.executeWithoutResult(statusB ->                           // B commits +5 -> version 1
                    stockService.apply(List.of(new StockChange(productId, 5)), StockDirection.IN));
            stockService.apply(List.of(new StockChange(productId, 3)), StockDirection.IN); // A works on its stale copy
            productRepository.flush();                                         // UPDATE ... WHERE version = 0 -> no row
        }));

        Integer quantity = jdbcTemplate.queryForObject("SELECT quantity FROM product WHERE id = ?", Integer.class, productId);
        assertEquals(15, quantity); // only B's change was saved, A's was rolled back completely
    }
}
