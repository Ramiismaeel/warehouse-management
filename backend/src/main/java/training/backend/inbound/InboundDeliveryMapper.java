package training.backend.inbound;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import training.backend.inbound.dto.InboundDeliveryItemResponse;
import training.backend.inbound.dto.InboundDeliveryDetailResponse;
import training.backend.inbound.dto.InboundDeliverySummaryResponse;

@Mapper(componentModel = "spring")
public interface InboundDeliveryMapper {


    @Mapping(target = "number", source = "deliveryNumber")
    InboundDeliverySummaryResponse toSummaryResponse(InboundDelivery inboundDelivery);



    @Mapping(target = "number", source = "deliveryNumber")
    InboundDeliveryDetailResponse toDetailResponse(InboundDelivery inboundDelivery);


    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "sku", source = "product.sku")
    @Mapping(target = "name", source = "product.name")
    @Mapping(target = "unit", source = "product.unit")
    InboundDeliveryItemResponse toItemResponse(InboundDeliveryItem item);
}
