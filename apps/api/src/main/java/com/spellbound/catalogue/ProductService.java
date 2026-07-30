package com.spellbound.catalogue;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductMapper productMapper;
    private final ProductVariantMapper productVariantMapper;

    public Page<ProductDto> findProducts(ProductStatus status, UUID categoryId, Pageable pageable) {
        ProductStatus statusToSearch = status != null ? status : ProductStatus.ACTIVE;
        Page<Product> products;
        if (categoryId != null) {
            products = productRepository.findByCategoryIdAndStatus(categoryId, statusToSearch, pageable);
        } else {
            products = productRepository.findByStatus(statusToSearch, pageable);
        }
        return products.map(productMapper::toDto);
    }

    public ProductDto findById(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + id));
        return productMapper.toDto(product);
    }

    public ProductDto findBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with slug: " + slug));
        return productMapper.toDto(product);
    }

    @Transactional
    public ProductDto createProduct(ProductCreateRequest request) {
        if (productRepository.existsBySlug(request.getSlug())) {
            throw new IllegalArgumentException("Product slug already exists: " + request.getSlug());
        }

        Product product = productMapper.toEntity(request);
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + request.getCategoryId()));
            product.setCategory(category);
        }

        if (request.getVariants() != null && !request.getVariants().isEmpty()) {
            product.setVariants(new ArrayList<>());
            for (ProductVariantCreateRequest vReq : request.getVariants()) {
                if (productVariantRepository.existsBySku(vReq.getSku())) {
                    throw new IllegalArgumentException("Variant SKU already exists: " + vReq.getSku());
                }
                ProductVariant variant = productVariantMapper.toEntity(vReq);
                variant.setProduct(product);
                product.getVariants().add(variant);
            }
        }

        Product saved = productRepository.save(product);
        return productMapper.toDto(saved);
    }

    @Transactional
    public ProductDto updateProduct(UUID id, ProductUpdateRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + id));

        if (request.getName() != null) {
            product.setName(request.getName());
        }
        if (request.getDescription() != null) {
            product.setDescription(request.getDescription());
        }
        if (request.getAttributes() != null) {
            product.setAttributes(request.getAttributes());
        }
        if (request.getStatus() != null) {
            product.setStatus(request.getStatus());
        }
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Category not found with id: " + request.getCategoryId()));
            product.setCategory(category);
        }

        Product updated = productRepository.save(product);
        return productMapper.toDto(updated);
    }

    @Transactional
    public ProductDto archiveProduct(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id: " + id));
        product.setStatus(ProductStatus.ARCHIVED);
        Product saved = productRepository.save(product);
        return productMapper.toDto(saved);
    }
}
