package training.backend.customer;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import training.backend.customer.dto.CustomerRequest;
import training.backend.customer.dto.CustomerResponse;

@Mapper(componentModel = "spring")
public interface CustomerMapper {

    CustomerResponse toResponse(Customer customer);

    Customer toEntity(CustomerRequest request);

    void updateEntity(CustomerRequest request, @MappingTarget Customer customer);
}
