package com.spellbound.inventory;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "inventory")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inventory {

    @Id
    @Column(name = "variant_id", nullable = false)
    private UUID variantId;

    @Column(name = "quantity_on_hand", nullable = false)
    private int quantityOnHand;

    @Column(name = "quantity_reserved", nullable = false)
    @Builder.Default
    private int quantityReserved = 0;

    @Column(name = "safety_buffer", nullable = false)
    @Builder.Default
    private int safetyBuffer = 0;

    @Column(name = "last_synced_at")
    private Instant lastSyncedAt;

    public int getSellableQuantity() {
        int sellable = quantityOnHand - quantityReserved - safetyBuffer;
        return Math.max(0, sellable);
    }
}
