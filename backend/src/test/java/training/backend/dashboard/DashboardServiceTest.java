package training.backend.dashboard;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.context.jdbc.SqlConfig;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import training.backend.inbound.dto.InboundDeliverySummaryResponse;
import training.backend.outbound.dto.OutboundOrderSummaryResponse;
import training.backend.product.dto.ProductResponse;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Runs against the real (H2) database. The clean script wipes existing seed data,
 * then the test data is inserted. Everything is rolled back after each test.
 * Expected values are documented at the top of dashboard-test-data.sql.
 */
@SpringBootTest
@Transactional
@ActiveProfiles("test")
@Sql(scripts ={"/dashboard/dashboard-clean.sql", "/dashboard/dashboard-test-data.sql"}, config = @SqlConfig(encoding = "UTF-8"))
class DashboardServiceTest {

    @Autowired
    private DashboardService dashboardService;

    @Test
    void counts_matchDatabase() {
        DashboardResponse result = dashboardService.getDashboard();

        assertThat(result.productCount()).isEqualTo(15);
        assertThat(result.customerCount()).isEqualTo(3);
        assertThat(result.lowStockCount()).isEqualTo(12);
        assertThat(result.outOfStockCount()).isEqualTo(1);
        assertThat(result.openInboundDrafts()).isEqualTo(2);
        assertThat(result.openOutboundDrafts()).isEqualTo(3);
    }

    @Test
    void lowStockProducts_maxTen_lowestQuantityFirst() {
        DashboardResponse result = dashboardService.getDashboard();

        assertThat(result.lowStockProducts())
                .extracting(ProductResponse::sku)
                .containsExactly("LOW-00", "LOW-01", "LOW-02", "LOW-03", "LOW-04",
                        "LOW-05", "LOW-06", "LOW-07", "LOW-08", "LOW-09");
    }

    @Test
    void lowStock_countsProductAtMinimum_butNotOneAbove() {
        DashboardResponse result = dashboardService.getDashboard();

        // 11 x LOW + EDGE-20 (quantity == minQuantity). OK-21 is not counted.
        assertThat(result.lowStockCount()).isEqualTo(12);
        assertThat(result.lowStockProducts())
                .extracting(ProductResponse::sku)
                .doesNotContain("OK-21", "OK-100", "OK-5");
    }

    @Test
    void recentInbound_fiveNewestByCreatedAt() {
        DashboardResponse result = dashboardService.getDashboard();

        assertThat(result.recentInbound())
                .extracting(InboundDeliverySummaryResponse::number)
                .containsExactly("WE-T-301", "WE-T-307", "WE-T-306", "WE-T-305", "WE-T-304");
    }

    @Test
    void recentOutbound_fiveNewestByCreatedAt_withCustomerName() {
        DashboardResponse result = dashboardService.getDashboard();

        assertThat(result.recentOutbound())
                .extracting(OutboundOrderSummaryResponse::number)
                .containsExactly("WA-T-406", "WA-T-405", "WA-T-404", "WA-T-403", "WA-T-402");
        assertThat(result.recentOutbound().getFirst().customerName()).isEqualTo("Weber Logistik KG");
    }

    @Test
    @Sql("/dashboard/dashboard-clean.sql") // replaces the class-level scripts: empty database
    void emptyDatabase_returnsZerosAndEmptyLists() {
        DashboardResponse result = dashboardService.getDashboard();

        assertThat(result.productCount()).isZero();
        assertThat(result.customerCount()).isZero();
        assertThat(result.lowStockCount()).isZero();
        assertThat(result.outOfStockCount()).isZero();
        assertThat(result.openInboundDrafts()).isZero();
        assertThat(result.openOutboundDrafts()).isZero();
        assertThat(result.lowStockProducts()).isEmpty();
        assertThat(result.recentInbound()).isEmpty();
        assertThat(result.recentOutbound()).isEmpty();
    }

    @Test
    void endpoint_returnsJsonWithAllFields() throws Exception {
        MockMvc mockMvc = MockMvcBuilders
                .standaloneSetup(new DashboardController(dashboardService))
                .build();

        mockMvc.perform(get("/api/v1/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productCount").value(15))
                .andExpect(jsonPath("$.customerCount").value(3))
                .andExpect(jsonPath("$.lowStockCount").value(12))
                .andExpect(jsonPath("$.outOfStockCount").value(1))
                .andExpect(jsonPath("$.openInboundDrafts").value(2))
                .andExpect(jsonPath("$.openOutboundDrafts").value(3))
                .andExpect(jsonPath("$.lowStockProducts.length()").value(10))
                .andExpect(jsonPath("$.recentInbound.length()").value(5))
                .andExpect(jsonPath("$.recentOutbound.length()").value(5))
                .andExpect(jsonPath("$.recentInbound[0].number").value("WE-T-301"));
    }
}