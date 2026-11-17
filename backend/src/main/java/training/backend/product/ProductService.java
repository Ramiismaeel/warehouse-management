package training.backend.product;

import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;
import training.backend.exceptions.DuplicateValueException;
import training.backend.exceptions.NotFoundException;
import training.backend.product.dto.ProductRequest;
import training.backend.product.dto.ProductResponse;


import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    @Transactional(readOnly = true)
    public List<ProductResponse> getAll() {
        return productRepository.findAll().stream().map(productMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse getById(Long id) {
        Product product = productRepository.findById(id).orElseThrow(() -> new NotFoundException("Product", id));

        return productMapper.toResponse(product);
    }

    public ProductResponse createProduct(ProductRequest request) {
        String sku = request.sku().trim().toUpperCase(Locale.ROOT);
        if(productRepository.existsBySku(sku)) {
            throw new DuplicateValueException(request.sku(), "this product is already in DB");
        }
        Product product = productMapper.toEntity(request);
        product.setSku(sku);
        return productMapper.toResponse(productRepository.save(product));
    }

    public ProductResponse updateProduct(ProductRequest request, Long id) {
        Product product = productRepository.findById(id).orElseThrow(()->  new NotFoundException("Product", id));
        String sku = request.sku().trim().toUpperCase(Locale.ROOT);
        if(productRepository.existsBySkuAndIdNot(sku, id)) {
            throw new DuplicateValueException(sku, "this product is already in DB");
        }

        productMapper.updateEntity(request, product);
        product.setSku(sku);
        return productMapper.toResponse(productRepository.saveAndFlush(product));
    }

    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id).orElseThrow(()->  new NotFoundException("Product", id));
        productRepository.delete(product);
    }
}
