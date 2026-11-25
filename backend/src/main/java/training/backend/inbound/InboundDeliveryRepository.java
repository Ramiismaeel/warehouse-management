package training.backend.inbound;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    /**
     * SELECT ... FOR UPDATE on the document row only: concurrent update/delete/confirm/cancel of the same
     * document wait for each other, so a status check can't be overtaken by a parallel request.
     * No fetch joins here (a row lock on the nullable side of an outer join is not allowed in PostgreSQL).
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select d from InboundDelivery d where d.id = :id")
    Optional<InboundDelivery> findByIdForUpdate(@Param("id") Long id);

    long countByStatus(DocumentStatus status);

    /** Items are loaded in batches (@BatchSize on InboundDelivery.items), never fetch-joined into a limited query. */
    List<InboundDelivery> findTop5ByOrderByCreatedAtDescIdDesc();

}
