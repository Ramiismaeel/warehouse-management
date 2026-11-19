package training.backend.customer;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;

import static org.assertj.core.api.Assertions.assertThat;

/** Checks the custom JPQL queries of CustomerRepository: search, sorting and usage count (business rule 7). */
@DataJpaTest
@ActiveProfiles("test")
@Sql("/customer/customer-usages.sql")
class CustomerRepositoryTest {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private TestEntityManager entityManager;

    // ---------- findAllByOrderByNameAsc ----------

    @Test
    void findAllByOrderByNameAsc_returnsCustomersSortedByName() {
        assertThat(customerRepository.findAllByOrderByNameAsc())
                .extracting(Customer::getName)
                .containsExactly("Kunde Alpha", "Kunde Beta", "Kunde Gamma");
    }

    // ---------- search ----------

    @Test
    void search_matchesNameCaseInsensitive() {
        assertThat(customerRepository.search("GAMMA"))
                .extracting(Customer::getName)
                .containsExactly("Kunde Gamma");
    }

    @Test
    void search_matchesCity() {
        assertThat(customerRepository.search("münch"))
                .extracting(Customer::getName)
                .containsExactly("Kunde Beta");
    }

    @Test
    void search_matchesEmail() {
        assertThat(customerRepository.search("mueller-bau"))
                .extracting(Customer::getName)
                .containsExactly("Kunde Alpha");
    }

    @Test
    void search_withPartialTermMatchingAll_returnsSortedByName() {
        assertThat(customerRepository.search("kunde"))
                .extracting(Customer::getName)
                .containsExactly("Kunde Alpha", "Kunde Beta", "Kunde Gamma");
    }

    @Test
    void search_whenNothingMatches_returnsEmptyList() {
        assertThat(customerRepository.search("xyz")).isEmpty();
    }

    // ---------- countOutboundOrderUsages ----------

    @Test
    void countOutboundOrderUsages_countsDocumentsOfEveryStatus() {
        assertThat(customerRepository.countOutboundOrderUsages(idOf("Kunde Alpha"))).isEqualTo(2);
        assertThat(customerRepository.countOutboundOrderUsages(idOf("Kunde Beta"))).isEqualTo(1);
    }

    @Test
    void countOutboundOrderUsages_whenUnused_returnsZero() {
        assertThat(customerRepository.countOutboundOrderUsages(idOf("Kunde Gamma"))).isZero();
    }

    private Long idOf(String name) {
        return entityManager.getEntityManager()
                .createQuery("select c.id from Customer c where c.name = :name", Long.class)
                .setParameter("name", name)
                .getSingleResult();
    }
}