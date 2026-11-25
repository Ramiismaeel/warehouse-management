package training.backend.product;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;

import static org.assertj.core.api.Assertions.assertThat;

/** Checks the custom JPQL queries: usage counts that guard product deletion (business rule 7) and the search. */
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

    // ---------- findAllByOrderBySkuAsc / search (search terms are LIKE-escaped by ProductService) ----------

    @Test
    @Sql("/product/product-search.sql")
    void findAllByOrderBySkuAsc_returnsProductsSortedBySku() {
        assertThat(productRepository.findAllByOrderBySkuAsc())
                .extracting(Product::getSku)
                .containsExactly("S-100", "S-200", "S-300", "S-400", "S-500");
    }

    @Test
    @Sql("/product/product-search.sql")
    void search_matchesNameCaseInsensitive_sortedBySku() {
        assertThat(productRepository.search("m4"))
                .extracting(Product::getSku)
                .containsExactly("S-100", "S-200");
    }

    @Test
    @Sql("/product/product-search.sql")
    void search_matchesSku() {
        assertThat(productRepository.search("s-3"))
                .extracting(Product::getSku)
                .containsExactly("S-300");
    }

    @Test
    @Sql("/product/product-search.sql")
    void search_withEscapedPercent_matchesPercentLiterally() {
        assertThat(productRepository.search("\\%"))
                .extracting(Product::getSku)
                .containsExactly("S-300");
    }

    @Test
    @Sql("/product/product-search.sql")
    void search_withEscapedUnderscore_matchesUnderscoreLiterally() {
        assertThat(productRepository.search("l\\_b"))
                .extracting(Product::getSku)
                .containsExactly("S-400");
    }

    @Test
    @Sql("/product/product-search.sql")
    void search_withEscapedBackslash_matchesBackslashLiterally() {
        assertThat(productRepository.search("a\\\\b"))
                .extracting(Product::getSku)
                .containsExactly("S-500");
    }

    @Test
    @Sql("/product/product-search.sql")
    void search_whenNothingMatches_returnsEmptyList() {
        assertThat(productRepository.search("xyz")).isEmpty();
    }

    private Long idOf(String sku) {
        return entityManager.getEntityManager()
                .createQuery("select p.id from Product p where p.sku = :sku", Long.class)
                .setParameter("sku", sku)
                .getSingleResult();
    }
}
