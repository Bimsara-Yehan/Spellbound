package com.spellbound.inventory;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final StockAdjustmentAuditRepository auditRepository;
    private final InventoryMapper inventoryMapper;

    public InventoryDto getInventory(UUID variantId) {
        Inventory inventory = inventoryRepository.findById(variantId)
                .orElseThrow(() -> new IllegalArgumentException("Inventory record not found for variantId: " + variantId));
        return inventoryMapper.toDto(inventory);
    }

    public List<InventoryDto> getAllInventories() {
        return inventoryRepository.findAll().stream()
                .map(inventoryMapper::toDto)
                .toList();
    }

    public List<InventoryDto> getLowStockInventories() {
        return inventoryRepository.findLowStockInventories().stream()
                .map(inventoryMapper::toDto)
                .toList();
    }

    public List<StockAdjustmentAuditDto> getAuditLogs(UUID variantId) {
        return auditRepository.findByVariantIdOrderByAdjustedAtDesc(variantId).stream()
                .map(inventoryMapper::toAuditDto)
                .toList();
    }

    @Transactional
    public InventoryDto adjustStock(UUID variantId, StockAdjustmentRequest request) {
        Inventory inventory = inventoryRepository.findById(variantId)
                .orElseGet(() -> Inventory.builder()
                        .variantId(variantId)
                        .quantityOnHand(0)
                        .quantityReserved(0)
                        .safetyBuffer(0)
                        .build());

        int previousQuantity = inventory.getQuantityOnHand();
        int newQuantity = request.getNewQuantity();
        int delta = newQuantity - previousQuantity;

        inventory.setQuantityOnHand(newQuantity);
        if (request.getSafetyBuffer() != null) {
            inventory.setSafetyBuffer(request.getSafetyBuffer());
        }

        Inventory saved = inventoryRepository.save(inventory);

        StockAdjustmentAudit audit = StockAdjustmentAudit.builder()
                .variantId(variantId)
                .actor(request.getActor())
                .previousQuantity(previousQuantity)
                .newQuantity(newQuantity)
                .quantityDelta(delta)
                .reason(request.getReason())
                .build();
        auditRepository.save(audit);

        return inventoryMapper.toDto(saved);
    }

    @Transactional
    public InventoryDto reserveStock(UUID variantId, int quantity) {
        Inventory inventory = inventoryRepository.findById(variantId)
                .orElseThrow(() -> new IllegalArgumentException("Inventory record not found for variantId: " + variantId));

        if (inventory.getSellableQuantity() < quantity) {
            throw new IllegalStateException("Insufficient sellable stock to reserve for variantId: " + variantId);
        }

        inventory.setQuantityReserved(inventory.getQuantityReserved() + quantity);
        Inventory saved = inventoryRepository.save(inventory);
        return inventoryMapper.toDto(saved);
    }

    @Transactional
    public InventoryDto releaseStockReservation(UUID variantId, int quantity) {
        Inventory inventory = inventoryRepository.findById(variantId)
                .orElseThrow(() -> new IllegalArgumentException("Inventory record not found for variantId: " + variantId));

        int newReserved = Math.max(0, inventory.getQuantityReserved() - quantity);
        inventory.setQuantityReserved(newReserved);
        Inventory saved = inventoryRepository.save(inventory);
        return inventoryMapper.toDto(saved);
    }
}
