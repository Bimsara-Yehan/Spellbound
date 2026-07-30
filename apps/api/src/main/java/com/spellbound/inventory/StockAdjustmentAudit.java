package com.spellbound.inventory;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "stock_adjustment_audit")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockAdjustmentAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "variant_id", nullable = false)
    private UUID variantId;

    @Column(nullable = false)
    private String actor;

    @Column(name = "quantity_delta", nullable = false)
    private int quantityDelta;

    @Column(name = "previous_quantity", nullable = false)
    private int previousQuantity;

    @Column(name = "new_quantity", nullable = false)
    private int newQuantity;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(name = "adjusted_at", nullable = false)
    private Instant adjustedAt;

    @PrePersist
    protected void onCreate() {
        if (this.adjustedAt == null) {
            this.adjustedAt = Instant.now();
        }
    }
}
