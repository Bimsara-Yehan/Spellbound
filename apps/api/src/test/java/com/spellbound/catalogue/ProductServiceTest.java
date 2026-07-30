package com.spellbound.catalogue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private ProductVariantRepository productVariantRepository;

    @Mock
    private ProductMapper productMapper;

    @Mock
    private ProductVariantMapper productVariantMapper;

    @InjectMocks
    private ProductService productService;

    private Product product;
    private ProductDto productDto;
    private UUID productId;

    @BeforeEach
    void setUp() {
        productId = UUID.randomUUID();
        product = Product.builder()
                .id(productId)
                .name("Test Product")
                .slug("test-product")
                .status(ProductStatus.ACTIVE)
                .build();

        productDto = ProductDto.builder()
                .id(productId)
                .name("Test Product")
                .slug("test-product")
                .status(ProductStatus.ACTIVE)
                .build();
    }

    @Test
    void findById_WhenExists_ShouldReturnDto() {
        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(productMapper.toDto(product)).thenReturn(productDto);

        ProductDto result = productService.findById(productId);

        assertThat(result.getSlug()).isEqualTo("test-product");
    }

    @Test
    void createProduct_WhenSlugExists_ShouldThrow() {
        ProductCreateRequest request = ProductCreateRequest.builder()
                .name("Test Product")
                .slug("test-product")
                .build();

        when(productRepository.existsBySlug("test-product")).thenReturn(true);

        assertThatThrownBy(() -> productService.createProduct(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("slug already exists");
    }

    @Test
    void archiveProduct_ShouldSetStatusToArchived() {
        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenReturn(product);
        when(productMapper.toDto(product)).thenReturn(productDto);

        productService.archiveProduct(productId);

        assertThat(product.getStatus()).isEqualTo(ProductStatus.ARCHIVED);
        verify(productRepository).save(product);
    }
}
