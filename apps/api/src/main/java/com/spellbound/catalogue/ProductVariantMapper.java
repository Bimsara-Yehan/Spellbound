package com.spellbound.catalogue;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductVariantMapper {

    @Mapping(target = "productId", source = "product.id")
    ProductVariantDto toDto(ProductVariant variant);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "product", ignore = true)
    ProductVariant toEntity(ProductVariantCreateRequest request);
}
