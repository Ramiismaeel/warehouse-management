package training.backend.outbound;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import training.backend.document.DocumentStatus;

import java.util.List;
import java.util.Optional;

@Repository
public interface OutboundOrderRepository extends JpaRepository<OutboundOrder, Long> {

    /** Fetches items and customer in the same query: the summary reads them (avoids N+1). */
    @Override
    @EntityGraph(attributePaths = {"items", "customer"})
    List<OutboundOrder> findAll();

    @EntityGraph(attributePaths = {"items", "customer"})
    List<OutboundOrder> findAllByStatus(DocumentStatus status);

    @EntityGraph(attributePaths = {"customer", "items", "items.product"})
    Optional<OutboundOrder> findWithItemsById(Long id);
}
