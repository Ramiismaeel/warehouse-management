package training.backend.product;

import org.mapstruct.InheritConfiguration;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import training.backend.product.dto.ProductRequest;
import training.backend.product.dto.ProductResponse;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    // Entity -> Response: used for every GET and as the result of POST/PUT
    @Mapping(target = "outOfStock")
    // Team rule: low stock as soon as quantity reaches minQuantity
    @Mapping(target = "lowStock")
    ProductResponse toResponse(Product product);

    // Request -> new Entity (POST)
    // quantity is never taken from the request; the init sets it to 0
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "quantity", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Product toEntity(ProductRequest request);

    // Request -> existing Entity (PUT): copies the request into the loaded product,
    // reusing the same ignore rules as toEntity
    @InheritConfiguration(name = "toEntity")
    void updateEntity(ProductRequest request, @MappingTarget Product product);
}