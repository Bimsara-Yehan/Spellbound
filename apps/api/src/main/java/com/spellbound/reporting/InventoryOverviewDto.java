package com.spellbound.reporting;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryOverviewDto {
    private long totalProducts;
    private long totalVariants;
    private long totalStockOnHand;
    private long totalStockReserved;
    private long lowStockVariantCount;
}
