package training.backend.stock;

public record Shortage(Long productId, String productName, int requested, int available) {
}
