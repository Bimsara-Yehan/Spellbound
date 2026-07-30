package com.spellbound.catalogue;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariantDto {
    private UUID id;
    private UUID productId;
    private String sku;
    private String optionValues;
    private long priceCents;
    private Long compareAtCents;
    private String posExternalId;
}
