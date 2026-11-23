package training.backend.dashboard;

import training.backend.inbound.dto.InboundDeliverySummaryResponse;
import training.backend.outbound.dto.OutboundOrderSummaryResponse;
import training.backend.product.dto.ProductResponse;

import java.util.List;

public record DashboardResponse(
        Long productCount,
        Long customerCount,
        Long lowStockCount,
        Long outOfStockCount,
        Long openInboundDrafts,
        Long openOutboundDrafts,
        List<ProductResponse> lowStockProducts,
        List<InboundDeliverySummaryResponse> recentInbound,
        List<OutboundOrderSummaryResponse> recentOutbound
) {
}
