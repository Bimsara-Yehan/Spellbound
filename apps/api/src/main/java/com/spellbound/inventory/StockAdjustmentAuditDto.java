package com.spellbound.inventory;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockAdjustmentAuditDto {
    private UUID id;
    private UUID variantId;
    private String actor;
    private int quantityDelta;
    private int previousQuantity;
    private int newQuantity;
    private String reason;
    private Instant adjustedAt;
}
