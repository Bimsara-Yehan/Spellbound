package com.spellbound.inventory;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private StockAdjustmentAuditRepository auditRepository;

    @Mock
    private InventoryMapper inventoryMapper;

    @InjectMocks
    private InventoryService inventoryService;

    private UUID variantId;
    private Inventory inventory;
    private InventoryDto inventoryDto;

    @BeforeEach
    void setUp() {
        variantId = UUID.randomUUID();
        inventory = Inventory.builder()
                .variantId(variantId)
                .quantityOnHand(50)
                .quantityReserved(5)
                .safetyBuffer(5)
                .build();

        inventoryDto = InventoryDto.builder()
                .variantId(variantId)
                .quantityOnHand(50)
                .quantityReserved(5)
                .safetyBuffer(5)
                .sellableQuantity(40)
                .build();
    }

    @Test
    void getInventory_ShouldReturnDto() {
        when(inventoryRepository.findById(variantId)).thenReturn(Optional.of(inventory));
        when(inventoryMapper.toDto(inventory)).thenReturn(inventoryDto);

        InventoryDto result = inventoryService.getInventory(variantId);

        assertThat(result.getSellableQuantity()).isEqualTo(40);
    }

    @Test
    void reserveStock_WhenSufficient_ShouldIncreaseReserved() {
        when(inventoryRepository.findById(variantId)).thenReturn(Optional.of(inventory));
        when(inventoryRepository.save(any(Inventory.class))).thenReturn(inventory);
        when(inventoryMapper.toDto(inventory)).thenReturn(inventoryDto);

        inventoryService.reserveStock(variantId, 10);

        assertThat(inventory.getQuantityReserved()).isEqualTo(15);
        verify(inventoryRepository).save(inventory);
    }

    @Test
    void reserveStock_WhenInsufficient_ShouldThrowException() {
        when(inventoryRepository.findById(variantId)).thenReturn(Optional.of(inventory));

        assertThatThrownBy(() -> inventoryService.reserveStock(variantId, 100))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Insufficient sellable stock");
    }

    @Test
    void adjustStock_ShouldUpdateOnHandAndCreateAudit() {
        StockAdjustmentRequest request = StockAdjustmentRequest.builder()
                .newQuantity(60)
                .safetyBuffer(10)
                .actor("admin")
                .reason("Restock")
                .build();

        when(inventoryRepository.findById(variantId)).thenReturn(Optional.of(inventory));
        when(inventoryRepository.save(any(Inventory.class))).thenReturn(inventory);
        when(inventoryMapper.toDto(inventory)).thenReturn(inventoryDto);

        inventoryService.adjustStock(variantId, request);

        assertThat(inventory.getQuantityOnHand()).isEqualTo(60);
        assertThat(inventory.getSafetyBuffer()).isEqualTo(10);
        verify(auditRepository).save(any(StockAdjustmentAudit.class));
    }
}
