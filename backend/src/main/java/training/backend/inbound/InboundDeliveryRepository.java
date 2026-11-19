package training.backend.inbound;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import training.backend.document.DocumentStatus;

import java.util.List;

@Repository
public interface InboundDeliveryRepository extends JpaRepository<InboundDelivery, Long> {

    List<InboundDelivery> findAllByStatus(DocumentStatus status);
}
