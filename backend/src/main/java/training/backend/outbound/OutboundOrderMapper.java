package training.backend.outbound;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import training.backend.customer.CustomerMapper;
import training.backend.outbound.dto.OutboundOrderDetailResponse;
import training.backend.outbound.dto.OutboundOrderItemResponse;
import training.backend.outbound.dto.OutboundOrderSummaryResponse;

@Mapper(componentModel = "spring", uses = CustomerMapper.class)
public interface OutboundOrderMapper {

    @Mapping(target = "number", source = "orderNumber")
    @Mapping(target = "customerName", source = "customer.name")
    OutboundOrderSummaryResponse toSummaryResponse(OutboundOrder outboundOrder);

    @Mapping(target = "number", source = "orderNumber")
    @Mapping(target = "customerName", source = "customer.name")
    OutboundOrderDetailResponse toDetailResponse(OutboundOrder outboundOrder);

    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "sku", source = "product.sku")
    @Mapping(target = "name", source = "product.name")
    @Mapping(target = "unit", source = "product.unit")
    OutboundOrderItemResponse toItemResponse(OutboundOrderItem item);
}
