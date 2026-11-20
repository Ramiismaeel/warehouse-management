package training.backend.inbound;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import training.backend.document.DocumentStatus;
import training.backend.product.Product;

import java.util.List;
import java.util.Optional;

@Repository
public interface InboundDeliveryRepository extends JpaRepository<InboundDelivery, Long> {

    List<InboundDelivery> findAllByStatus(DocumentStatus status);

    @EntityGraph(attributePaths = {"items", "items.product"})
    Optional<InboundDelivery> findWithItemsById(Long id);

}
