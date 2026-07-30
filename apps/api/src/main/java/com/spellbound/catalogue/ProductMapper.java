package com.spellbound.catalogue;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {CategoryMapper.class, ProductVariantMapper.class})
public interface ProductMapper {

    ProductDto toDto(Product product);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "lastSyncedAt", ignore = true)
    @Mapping(target = "syncStatus", ignore = true)
    @Mapping(target = "variants", ignore = true)
    Product toEntity(ProductCreateRequest request);
}
