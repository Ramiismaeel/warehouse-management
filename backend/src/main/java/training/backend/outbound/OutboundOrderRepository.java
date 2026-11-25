package training.backend.outbound;

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
public interface OutboundOrderRepository extends JpaRepository<OutboundOrder, Long> {

    /** Fetches items and customer in the same query: the summary reads them (avoids N+1). */
    @Override
    @EntityGraph(attributePaths = {"items", "customer"})
    List<OutboundOrder> findAll();

    @EntityGraph(attributePaths = {"items", "customer"})
    List<OutboundOrder> findAllByStatus(DocumentStatus status);

    @EntityGraph(attributePaths = {"customer", "items", "items.product"})
    Optional<OutboundOrder> findWithItemsById(Long id);

    /**
     * SELECT ... FOR UPDATE on the document row only: concurrent update/delete/confirm/cancel of the same
     * document wait for each other, so a status check can't be overtaken by a parallel request.
     * No fetch joins here (a row lock on the nullable side of an outer join is not allowed in PostgreSQL).
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select o from OutboundOrder o where o.id = :id")
    Optional<OutboundOrder> findByIdForUpdate(@Param("id") Long id);

    long countByStatus(DocumentStatus status);

    /**
     * Customer is fetched in the same query (to-one, safe with a limit). Items are loaded in batches
     * (@BatchSize on OutboundOrder.items), never fetch-joined into a limited query.
     */
    @EntityGraph(attributePaths = {"customer"})
    List<OutboundOrder> findTop5ByOrderByCreatedAtDescIdDesc();
}
