package training.backend.stock;

public record StockChange(Long productId, int quantity) {

    public StockChange {
        if(productId == null) {
            throw new IllegalArgumentException("productId must not be null");
        }
        if(quantity <= 0) {
            throw new IllegalArgumentException("quantity must be greater than 0, was " + quantity);
        }
    }
}
