package com.spellbound.catalogue;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "product_variant", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"product_id", "option_values"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false, unique = true)
    private String sku;

    @Column(name = "option_values", nullable = false, columnDefinition = "TEXT")
    private String optionValues;

    @Column(name = "price_cents", nullable = false)
    private long priceCents;

    @Column(name = "compare_at_cents")
    private Long compareAtCents;

    @Column(name = "pos_external_id")
    private String posExternalId;
}
