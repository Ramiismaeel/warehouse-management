package training.backend.product;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    public boolean existsBySku(String sku);
    public boolean existsBySkuAndIdNot(String sku, Long id);
}
