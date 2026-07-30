package com.spellbound.catalogue;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariantCreateRequest {

    @NotBlank(message = "SKU is required")
    private String sku;

    @NotBlank(message = "Option values JSON is required")
    private String optionValues;

    @Min(value = 0, message = "Price in cents must be non-negative")
    private long priceCents;

    private Long compareAtCents;
    private String posExternalId;
}
