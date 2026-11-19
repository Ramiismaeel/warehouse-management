package training.backend.inbound;

import org.mapstruct.Mapper;
import training.backend.inbound.dto.SummaryResponse;

@Mapper(componentModel = "spring")
public interface InboundDeliveryMapper {

    SummaryResponse toResponse(InboundDelivery inboundDelivery);
}
