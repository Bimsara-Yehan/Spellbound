package com.spellbound.catalogue;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDto {
    private UUID id;
    private String slug;
    private String name;
    private String description;
    private CategoryDto category;
    private ProductStatus status;
    private String attributes;
    private String posExternalId;
    private Instant lastSyncedAt;
    private SyncStatus syncStatus;
    private Instant createdAt;
    private Instant updatedAt;
    private List<ProductVariantDto> variants;
}
