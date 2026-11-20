package training.backend.stock;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import training.backend.exceptions.InsufficientStockException;
import training.backend.exceptions.InsufficientStockException.Shortage;
import training.backend.product.Product;
import training.backend.product.ProductRepository;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StockService {

    private final ProductRepository productRepository;

    @Transactional
    public void apply(List<StockChange> changes, StockDirection direction) {
        Objects.requireNonNull(direction, "direction must be not null");
        if(changes == null || changes.isEmpty()) {
            throw new IllegalArgumentException("changes must not be empty");
        }


        // 1. Merge lines for the same product (two lines of 3 + 4 = 7 must be checked as 7)
        Map<Long, Integer> totals = changes.stream()
                .collect(Collectors.toMap(
                        StockChange::productId,
                        StockChange::quantity,
                        Integer::sum,
                        LinkedHashMap::new));

        Map<Long , Product> products = productRepository.findAllById(totals.keySet()).stream()
                .collect(Collectors.toMap(Product::getId, Function.identity()));


        List<Long> missing = totals.keySet().stream()
                .filter(id -> !products.containsKey(id))
                .toList();

        if(!missing.isEmpty()) {
            throw new IllegalArgumentException("Unknown product ids: " + missing);
        }

        if(direction == StockDirection.OUT) {
            List<Shortage> shortages = new ArrayList<>();
            totals.forEach((id, requested) -> {
                Product product = products.get(id);
                if(product.getQuantity()< requested) {
                    shortages.add(new Shortage(id, product.getSku(), product.getName(), requested, product.getQuantity()));
                }
            });
            if(!shortages.isEmpty()) {
                throw new InsufficientStockException(shortages);
            }
        }

        totals.forEach((id, quantity) -> {
            Product product = products.get(id);
            int delta = direction == StockDirection.IN ? quantity : -quantity;
            product.changeQuantity(delta);
        });
    }
}
