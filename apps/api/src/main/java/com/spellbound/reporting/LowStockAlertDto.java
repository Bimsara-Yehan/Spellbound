package com.spellbound.reporting;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LowStockAlertDto {
    private UUID variantId;
    private String sku;
    private String productName;
    private int quantityOnHand;
    private int quantityReserved;
    private int safetyBuffer;
    private int sellableQuantity;
}
