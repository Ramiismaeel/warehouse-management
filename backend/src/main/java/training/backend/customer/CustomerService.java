package training.backend.customer;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import training.backend.customer.dto.CustomerRequest;
import training.backend.customer.dto.CustomerResponse;
import training.backend.exceptions.EntityInUseException;
import training.backend.exceptions.NotFoundException;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CustomerService {

    private static final String ENTITY_LABEL = "Kunde";

    private final CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;

    @Transactional(readOnly = true)
    public List<CustomerResponse> getAll(String q) {
        List<Customer> customers = ( q == null || q.isBlank())
                ? customerRepository.findAllByOrderByNameAsc()
                : customerRepository.search(q.trim());

        return customers.stream().map(customerMapper::toResponse).toList();

    }

    @Transactional(readOnly = true)
    public CustomerResponse getById(Long id) {
        return customerMapper.toResponse(findCustomer(id));
    }

    public CustomerResponse createCustomer(CustomerRequest request) {
        Customer customer = customerMapper.toEntity(request);
        return customerMapper.toResponse(customerRepository.save(customer));

    }

    public CustomerResponse updateCustomer(Long id, CustomerRequest request) {
        Customer customer = findCustomer(id);
        customerMapper.updateEntity(request, customer);

        return customerMapper.toResponse(customerRepository.saveAndFlush(customer));
    }

    /** Business rule 7: a customer used in any Warenausgang (any status) cannot be deleted. */
    public void deleteCustomer(Long id) {
        Customer customer = findCustomer(id);
        long usages = customerRepository.countOutboundOrderUsages(id);
        if (usages > 0) {
            throw new EntityInUseException(ENTITY_LABEL, customer.getName(), usages);
        }
        customerRepository.delete(customer);
    }

    private Customer findCustomer(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(ENTITY_LABEL, id));
    }
}
