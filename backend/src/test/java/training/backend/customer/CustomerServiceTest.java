package training.backend.customer;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import training.backend.customer.dto.CustomerRequest;
import training.backend.customer.dto.CustomerResponse;
import training.backend.exceptions.EntityInUseException;
import training.backend.exceptions.NotFoundException;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/** Unit tests for CustomerService. Uses the real MapStruct mapper so the mapping is covered too. */
@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    private CustomerService customerService;

    @BeforeEach
    void setUp() {
        customerService = new CustomerService(customerRepository, new CustomerMapperImpl());
    }

    // ---------- getAll ----------

    @Test
    void getAll_withoutSearchTerm_returnsAllSortedByName() {
        when(customerRepository.findAllByOrderByNameAsc()).thenReturn(List.of(
                customer(1L, "Bäckerei Weber"), customer(2L, "Müller Bau GmbH")));

        List<CustomerResponse> result = customerService.getAll(null);

        assertThat(result).extracting(CustomerResponse::name).containsExactly("Bäckerei Weber", "Müller Bau GmbH");
        verify(customerRepository, never()).search(anyString());
    }

    @Test
    void getAll_withBlankSearchTerm_returnsAll() {
        when(customerRepository.findAllByOrderByNameAsc()).thenReturn(List.of(customer(1L, "Bäckerei Weber")));

        assertThat(customerService.getAll("   ")).hasSize(1);
        verify(customerRepository, never()).search(anyString());
    }

    @Test
    void getAll_withSearchTerm_searchesWithTrimmedTerm() {
        when(customerRepository.search("bau")).thenReturn(List.of(customer(2L, "Müller Bau GmbH")));

        List<CustomerResponse> result = customerService.getAll("  bau  ");

        assertThat(result).extracting(CustomerResponse::name).containsExactly("Müller Bau GmbH");
        verify(customerRepository, never()).findAllByOrderByNameAsc();
    }

    // ---------- getById ----------

    @Test
    void getById_whenFound_returnsMappedCustomer() {
        when(customerRepository.findById(1L)).thenReturn(Optional.of(customer(1L, "Müller Bau GmbH")));

        CustomerResponse result = customerService.getById(1L);

        assertThat(result.id()).isEqualTo(1L);
        assertThat(result.name()).isEqualTo("Müller Bau GmbH");
        assertThat(result.zipCode()).isEqualTo("10115");
        assertThat(result.city()).isEqualTo("Berlin");
    }

    @Test
    void getById_whenMissing_throwsNotFound() {
        when(customerRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> customerService.getById(99L))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Kunde mit ID 99 wurde nicht gefunden.");
    }

    // ---------- createCustomer ----------

    @Test
    void createCustomer_mapsAllFieldsAndSaves() {
        when(customerRepository.save(any(Customer.class))).thenAnswer(inv -> inv.getArgument(0));

        CustomerResponse result = customerService.createCustomer(request("Neu GmbH"));

        assertThat(result.name()).isEqualTo("Neu GmbH");
        assertThat(result.email()).isEqualTo("info@neu.example");
        assertThat(result.phone()).isEqualTo("+49 30 111");
        assertThat(result.street()).isEqualTo("Neue Straße 1");
        assertThat(result.zipCode()).isEqualTo("12345");
        assertThat(result.city()).isEqualTo("Potsdam");
        verify(customerRepository).save(any(Customer.class));
    }

    // ---------- updateCustomer ----------

    @Test
    void updateCustomer_whenFound_overwritesFieldsAndKeepsId() {
        Customer existing = customer(1L, "Alter Name");
        when(customerRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(customerRepository.saveAndFlush(existing)).thenReturn(existing);

        CustomerResponse result = customerService.updateCustomer(1L, request("Neuer Name"));

        assertThat(result.id()).isEqualTo(1L);
        assertThat(result.name()).isEqualTo("Neuer Name");
        assertThat(result.city()).isEqualTo("Potsdam");
        assertThat(existing.getName()).isEqualTo("Neuer Name");
    }

    @Test
    void updateCustomer_whenMissing_throwsNotFoundAndSavesNothing() {
        when(customerRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> customerService.updateCustomer(99L, request("Egal")))
                .isInstanceOf(NotFoundException.class);

        verify(customerRepository, never()).saveAndFlush(any());
    }

    // ---------- deleteCustomer ----------

    @Test
    void deleteCustomer_whenNotUsedInAnyDocument_deletesIt() {
        Customer existing = customer(1L, "Bäckerei Weber");
        when(customerRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(customerRepository.countOutboundOrderUsages(1L)).thenReturn(0L);

        customerService.deleteCustomer(1L);

        verify(customerRepository).delete(existing);
    }

    @Test
    void deleteCustomer_whenUsedInOutboundOrders_throwsInUseAndDeletesNothing() {
        Customer existing = customer(1L, "Müller Bau GmbH");
        when(customerRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(customerRepository.countOutboundOrderUsages(1L)).thenReturn(3L);

        assertThatThrownBy(() -> customerService.deleteCustomer(1L))
                .isInstanceOf(EntityInUseException.class)
                .hasMessage("Kunde „Müller Bau GmbH“ wird in 3 Belegen verwendet.");

        verify(customerRepository, never()).delete(any());
    }

    @Test
    void deleteCustomer_whenMissing_throwsNotFoundAndDeletesNothing() {
        when(customerRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> customerService.deleteCustomer(99L))
                .isInstanceOf(NotFoundException.class);

        verify(customerRepository, never()).delete(any());
    }

    // ---------- helpers ----------

    private static CustomerRequest request(String name) {
        return new CustomerRequest(name, "info@neu.example", "+49 30 111", "Neue Straße 1", "12345", "Potsdam");
    }

    /** Builds a customer as if loaded from the DB. id has no setter, so it is set via reflection. */
    private static Customer customer(Long id, String name) {
        Customer customer = new Customer();
        ReflectionTestUtils.setField(customer, "id", id);
        customer.setName(name);
        customer.setZipCode("10115");
        customer.setCity("Berlin");
        return customer;
    }
}
