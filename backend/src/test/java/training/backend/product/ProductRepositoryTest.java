package training.backend.product;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;

import static org.assertj.core.api.Assertions.assertThat;

/** Checks the custom JPQL usage counts that guard product deletion (business rule 7). */
@DataJpaTest
@ActiveProfiles("test")
@Sql("/product/product-usages.sql")
class ProductRepositoryTest {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    void countUsages_countsDocumentsOfEveryStatus() {
        Long id = idOf("P-USED-BOTH");

        assertThat(productRepository.countInboundDeliveryUsages(id)).isEqualTo(2);
        assertThat(productRepository.countOutboundOrderUsages(id)).isEqualTo(1);
    }

    @Test
    void countUsages_whenUsedOnlyInOutboundOrder_countsOnlyThat() {
        Long id = idOf("P-USED-OUT");

        assertThat(productRepository.countInboundDeliveryUsages(id)).isZero();
        assertThat(productRepository.countOutboundOrderUsages(id)).isEqualTo(1);
    }

    @Test
    void countUsages_whenUnused_returnsZero() {
        Long id = idOf("P-UNUSED");

        assertThat(productRepository.countInboundDeliveryUsages(id)).isZero();
        assertThat(productRepository.countOutboundOrderUsages(id)).isZero();
    }

    @Test
    void existsBySkuAndIdNot_ignoresTheProductItself() {
        Long id = idOf("P-UNUSED");

        assertThat(productRepository.existsBySkuAndIdNot("P-UNUSED", id)).isFalse();
        assertThat(productRepository.existsBySkuAndIdNot("P-USED-OUT", id)).isTrue();
    }

    private Long idOf(String sku) {
        return entityManager.getEntityManager()
                .createQuery("select p.id from Product p where p.sku = :sku", Long.class)
                .setParameter("sku", sku)
                .getSingleResult();
    }
}
