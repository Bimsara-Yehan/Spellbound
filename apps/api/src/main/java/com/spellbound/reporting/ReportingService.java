package com.spellbound.reporting;

import com.spellbound.catalogue.ProductRepository;
import com.spellbound.catalogue.ProductVariant;
import com.spellbound.catalogue.ProductVariantRepository;
import com.spellbound.inventory.Inventory;
import com.spellbound.inventory.InventoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportingService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final InventoryRepository inventoryRepository;

    public InventoryOverviewDto getInventoryOverview() {
        long totalProducts = productRepository.count();
        long totalVariants = variantRepository.count();
        List<Inventory> allInventories = inventoryRepository.findAll();

        long totalOnHand = allInventories.stream().mapToLong(Inventory::getQuantityOnHand).sum();
        long totalReserved = allInventories.stream().mapToLong(Inventory::getQuantityReserved).sum();
        List<Inventory> lowStockList = inventoryRepository.findLowStockInventories();

        return InventoryOverviewDto.builder()
                .totalProducts(totalProducts)
                .totalVariants(totalVariants)
                .totalStockOnHand(totalOnHand)
                .totalStockReserved(totalReserved)
                .lowStockVariantCount(lowStockList.size())
                .build();
    }

    public List<LowStockAlertDto> getLowStockAlerts() {
        List<Inventory> lowStockInventories = inventoryRepository.findLowStockInventories();
        List<LowStockAlertDto> alerts = new ArrayList<>();

        for (Inventory inventory : lowStockInventories) {
            Optional<ProductVariant> variantOpt = variantRepository.findById(inventory.getVariantId());
            String sku = variantOpt.map(ProductVariant::getSku).orElse("UNKNOWN");
            String productName = variantOpt.map(v -> v.getProduct().getName()).orElse("UNKNOWN");

            alerts.add(LowStockAlertDto.builder()
                    .variantId(inventory.getVariantId())
                    .sku(sku)
                    .productName(productName)
                    .quantityOnHand(inventory.getQuantityOnHand())
                    .quantityReserved(inventory.getQuantityReserved())
                    .safetyBuffer(inventory.getSafetyBuffer())
                    .sellableQuantity(inventory.getSellableQuantity())
                    .build());
        }

        return alerts;
    }
}
