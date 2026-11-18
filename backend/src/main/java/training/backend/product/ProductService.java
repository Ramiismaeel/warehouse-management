package training.backend.product;

import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;
import training.backend.exceptions.DuplicateValueException;
import training.backend.exceptions.EntityInUseException;
import training.backend.exceptions.NotFoundException;
import training.backend.product.dto.ProductRequest;
import training.backend.product.dto.ProductResponse;


import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductService {

    private static final String ENTITY_LABEL = "Artikel";

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    @Transactional(readOnly = true)
    public List<ProductResponse> getAll() {
        return productRepository.findAll().stream().map(productMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse getById(Long id) {
        return productMapper.toResponse(findProduct(id));
    }

    public ProductResponse createProduct(ProductRequest request) {
        String sku = normalizeSku(request.sku());
        if (productRepository.existsBySku(sku)) {
            throw duplicateSku(sku);
        }
        Product product = productMapper.toEntity(request);
        product.setSku(sku);
        return productMapper.toResponse(productRepository.save(product));
    }

    public ProductResponse updateProduct(ProductRequest request, Long id) {
        Product product = findProduct(id);
        String sku = normalizeSku(request.sku());
        if (productRepository.existsBySkuAndIdNot(sku, id)) {
            throw duplicateSku(sku);
        }

        productMapper.updateEntity(request, product);
        product.setSku(sku);
        return productMapper.toResponse(productRepository.saveAndFlush(product));
    }

    /** Business rule 7: a product used in any document (any status) cannot be deleted. */
    public void deleteProduct(Long id) {
        Product product = findProduct(id);
        long usages = productRepository.countInboundDeliveryUsages(id)
                + productRepository.countOutboundOrderUsages(id);
        if (usages > 0) {
            throw new EntityInUseException(ENTITY_LABEL, product.getName(), usages);
        }
        productRepository.delete(product);
    }

    private Product findProduct(Long id) {
        return productRepository.findById(id).orElseThrow(() -> new NotFoundException(ENTITY_LABEL, id));
    }

    private static String normalizeSku(String sku) {
        return sku.trim().toUpperCase(Locale.ROOT);
    }

    private static DuplicateValueException duplicateSku(String sku) {
        return new DuplicateValueException("sku", "Die SKU „%s“ ist bereits vergeben.".formatted(sku));
    }
}
