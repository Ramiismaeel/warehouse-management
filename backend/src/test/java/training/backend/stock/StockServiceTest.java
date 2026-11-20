package training.backend.stock;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.BeanUtils;
import org.springframework.test.util.ReflectionTestUtils;

import training.backend.exceptions.InsufficientStockException;
import training.backend.product.Product;
import training.backend.product.ProductRepository;

@ExtendWith(MockitoExtension.class)
class StockServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private StockService stockService;

    // Product's no-args constructor is protected and id lives in BaseEntity,
    // so the test creates it via reflection.
    private Product product(long id, String name, int quantity) {
        Product p = BeanUtils.instantiateClass(Product.class);
        ReflectionTestUtils.setField(p, "id", id);
        p.setName(name);
        p.changeQuantity(quantity);
        return p;
    }

    @Test
    void inIncreasesQuantity() {
        Product schraube = product(1L, "Schraube", 10);
        when(productRepository.findAllById(any())).thenReturn(List.of(schraube));

        stockService.apply(List.of(new StockChange(1L, 5)), StockDirection.IN);

        assertEquals(15, schraube.getQuantity());
    }

    @Test
    void outDecreasesQuantity() {
        Product schraube = product(1L, "Schraube", 10);
        when(productRepository.findAllById(any())).thenReturn(List.of(schraube));

        stockService.apply(List.of(new StockChange(1L, 4)), StockDirection.OUT);

        assertEquals(6, schraube.getQuantity());
    }

    @Test
    void outWithOneShortageChangesNothing() {
        Product schraube = product(1L, "Schraube", 10);
        Product mutter = product(2L, "Mutter", 2);
        when(productRepository.findAllById(any())).thenReturn(List.of(schraube, mutter));

        InsufficientStockException ex = assertThrows(InsufficientStockException.class, () ->
                stockService.apply(List.of(
                                new StockChange(1L, 5),   // enough
                                new StockChange(2L, 3)),  // short
                        StockDirection.OUT));

        assertEquals(10, schraube.getQuantity()); // untouched, although it had enough
        assertEquals(2, mutter.getQuantity());
        assertEquals(1, ex.getShortages().size());
        assertEquals(2L, ex.getShortages().getFirst().productId());
    }

    @Test
    void outReportsEveryShortage() {
        Product schraube = product(1L, "Schraube", 1);
        Product mutter = product(2L, "Mutter", 0);
        when(productRepository.findAllById(any())).thenReturn(List.of(schraube, mutter));

        InsufficientStockException ex = assertThrows(InsufficientStockException.class, () ->
                stockService.apply(List.of(
                                new StockChange(1L, 5),
                                new StockChange(2L, 3)),
                        StockDirection.OUT));

        assertEquals(2, ex.getShortages().size());
    }

    @Test
    void duplicateLinesForSameProductAreSummed() {
        Product schraube = product(1L, "Schraube", 5);
        when(productRepository.findAllById(any())).thenReturn(List.of(schraube));

        // 3 + 3 = 6 > 5, each line alone would pass
        assertThrows(InsufficientStockException.class, () ->
                stockService.apply(List.of(
                                new StockChange(1L, 3),
                                new StockChange(1L, 3)),
                        StockDirection.OUT));

        assertEquals(5, schraube.getQuantity());
    }

    @Test
    void zeroOrNegativeQuantityIsRejected() {
        assertThrows(IllegalArgumentException.class, () -> new StockChange(1L, 0));
        assertThrows(IllegalArgumentException.class, () -> new StockChange(1L, -5));
    }
}