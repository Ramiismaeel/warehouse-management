package training.backend.inbound;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import training.backend.inbound.dto.DeliveryItemResponse;
import training.backend.inbound.dto.DetailResponse;
import training.backend.inbound.dto.SummaryResponse;

@Mapper(componentModel = "spring")
public interface InboundDeliveryMapper {


    @Mapping(target = "number", source = "deliveryNumber")
    SummaryResponse toSummaryResponse(InboundDelivery inboundDelivery);



    @Mapping(target = "number", source = "deliveryNumber")
    DetailResponse toDetailResponse(InboundDelivery inboundDelivery);


    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "sku", source = "product.sku")
    @Mapping(target = "name", source = "product.name")
    @Mapping(target = "unit", source = "product.unit")
    DeliveryItemResponse toItemResponse(InboundDeliveryItem item);
}
