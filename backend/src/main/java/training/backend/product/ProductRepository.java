package training.backend.product;

import org.springframework.data.domain.Limit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    boolean existsBySku(String sku);

    boolean existsBySkuAndIdNot(String sku, Long id);

    /**
     * Number of Wareneingänge (any status) that contain the product.
     * A product appears at most once per document (rule 6), so items = documents.
     */
    @Query("select count(i) from InboundDeliveryItem i where i.product.id = :productId")
    long countInboundDeliveryUsages(@Param("productId") Long productId);

    /** Number of Warenausgänge (any status) that contain the product. */
    @Query("select count(i) from OutboundOrderItem i where i.product.id = :productId")
    long countOutboundOrderUsages(@Param("productId") Long productId);

    @Query("select count(p) from Product p where p.quantity <= p.minQuantity")
    long countLowStock();

    long countByQuantity(int quantity);

    @Query("select p from Product p where p.quantity <= p.minQuantity order by p.quantity asc, p.name asc")
    List<Product> findLowStock(Limit limit);
}
