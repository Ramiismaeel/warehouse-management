package training.backend.inbound;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import training.backend.document.DocumentStatus;

import java.util.List;
import java.util.Optional;

@Repository
public interface InboundDeliveryRepository extends JpaRepository<InboundDelivery, Long> {

    /** Fetches items in the same query: the summary reads itemCount and totalQuantity (avoids N+1). */
    @Override
    @EntityGraph(attributePaths = {"items"})
    List<InboundDelivery> findAll();

    @EntityGraph(attributePaths = {"items"})
    List<InboundDelivery> findAllByStatus(DocumentStatus status);

    @EntityGraph(attributePaths = {"items", "items.product"})
    Optional<InboundDelivery> findWithItemsById(Long id);

}
