package com.spellbound.catalogue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private CategoryMapper categoryMapper;

    @InjectMocks
    private CategoryService categoryService;

    private Category category;
    private CategoryDto categoryDto;

    @BeforeEach
    void setUp() {
        category = Category.builder()
                .id(UUID.randomUUID())
                .name("Electronics")
                .slug("electronics")
                .description("Gadgets and electronic items")
                .build();

        categoryDto = CategoryDto.builder()
                .id(category.getId())
                .name("Electronics")
                .slug("electronics")
                .description("Gadgets and electronic items")
                .build();
    }

    @Test
    void findAll_ShouldReturnCategoryList() {
        when(categoryRepository.findAll()).thenReturn(List.of(category));
        when(categoryMapper.toDto(category)).thenReturn(categoryDto);

        List<CategoryDto> result = categoryService.findAll();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getSlug()).isEqualTo("electronics");
    }

    @Test
    void findBySlug_WhenExists_ShouldReturnCategoryDto() {
        when(categoryRepository.findBySlug("electronics")).thenReturn(Optional.of(category));
        when(categoryMapper.toDto(category)).thenReturn(categoryDto);

        CategoryDto result = categoryService.findBySlug("electronics");

        assertThat(result.getName()).isEqualTo("Electronics");
    }

    @Test
    void createCategory_WhenSlugExists_ShouldThrowException() {
        CategoryCreateRequest request = CategoryCreateRequest.builder()
                .name("Electronics")
                .slug("electronics")
                .build();

        when(categoryRepository.existsBySlug("electronics")).thenReturn(true);

        assertThatThrownBy(() -> categoryService.createCategory(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    void createCategory_Valid_ShouldSaveAndReturn() {
        CategoryCreateRequest request = CategoryCreateRequest.builder()
                .name("Electronics")
                .slug("electronics")
                .build();

        when(categoryRepository.existsBySlug("electronics")).thenReturn(false);
        when(categoryMapper.toEntity(request)).thenReturn(category);
        when(categoryRepository.save(category)).thenReturn(category);
        when(categoryMapper.toDto(category)).thenReturn(categoryDto);

        CategoryDto created = categoryService.createCategory(request);

        assertThat(created).isNotNull();
        verify(categoryRepository).save(any(Category.class));
    }
}
