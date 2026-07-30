package com.spellbound.inventory;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<List<InventoryDto>> getAllInventories() {
        return ResponseEntity.ok(inventoryService.getAllInventories());
    }

    @GetMapping("/{variantId}")
    public ResponseEntity<InventoryDto> getInventory(@PathVariable UUID variantId) {
        return ResponseEntity.ok(inventoryService.getInventory(variantId));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<InventoryDto>> getLowStockInventories() {
        return ResponseEntity.ok(inventoryService.getLowStockInventories());
    }

    @GetMapping("/{variantId}/audit")
    public ResponseEntity<List<StockAdjustmentAuditDto>> getAuditLogs(@PathVariable UUID variantId) {
        return ResponseEntity.ok(inventoryService.getAuditLogs(variantId));
    }

    @PostMapping("/{variantId}/adjust")
    public ResponseEntity<InventoryDto> adjustStock(
            @PathVariable UUID variantId,
            @Valid @RequestBody StockAdjustmentRequest request) {
        return ResponseEntity.ok(inventoryService.adjustStock(variantId, request));
    }

    @PostMapping("/{variantId}/reserve")
    public ResponseEntity<InventoryDto> reserveStock(
            @PathVariable UUID variantId,
            @RequestParam int quantity) {
        return ResponseEntity.ok(inventoryService.reserveStock(variantId, quantity));
    }

    @PostMapping("/{variantId}/release")
    public ResponseEntity<InventoryDto> releaseStock(
            @PathVariable UUID variantId,
            @RequestParam int quantity) {
        return ResponseEntity.ok(inventoryService.releaseStockReservation(variantId, quantity));
    }
}
