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
public class InventoryDto {
    private UUID variantId;
    private int quantityOnHand;
    private int quantityReserved;
    private int safetyBuffer;
    private int sellableQuantity;
    private Instant lastSyncedAt;
}
