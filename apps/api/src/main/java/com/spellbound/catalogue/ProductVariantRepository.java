package com.spellbound.catalogue;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, UUID> {
    Optional<ProductVariant> findBySku(String sku);
    boolean existsBySku(String sku);
    List<ProductVariant> findByProductId(UUID productId);
    Optional<ProductVariant> findByPosExternalId(String posExternalId);
}
