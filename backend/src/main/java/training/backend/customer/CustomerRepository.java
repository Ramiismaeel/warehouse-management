package training.backend.customer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    List<Customer> findAllByOrderByNameAsc();

    @Query("""
            select c from Customer c
            where lower(c.name)  like lower(concat('%', :q, '%'))
               or lower(c.city)  like lower(concat('%', :q, '%'))
               or lower(c.email) like lower(concat('%', :q, '%'))
            order by c.name
            """)
    List<Customer> search(@Param("q") String q);


    @Query("select count(o) from OutboundOrder o where o.customer.id = :customerId")
    long countOutboundOrderUsages(@Param("customerId") Long customerId);
}
