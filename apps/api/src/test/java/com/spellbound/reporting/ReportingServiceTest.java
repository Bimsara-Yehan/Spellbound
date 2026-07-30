package com.spellbound.reporting;

import com.spellbound.catalogue.ProductRepository;
import com.spellbound.catalogue.ProductVariantRepository;
import com.spellbound.inventory.Inventory;
import com.spellbound.inventory.InventoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReportingServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductVariantRepository variantRepository;

    @Mock
    private InventoryRepository inventoryRepository;

    @InjectMocks
    private ReportingService reportingService;

    private UUID variantId;
    private Inventory inventory;

    @BeforeEach
    void setUp() {
        variantId = UUID.randomUUID();
        inventory = Inventory.builder()
                .variantId(variantId)
                .quantityOnHand(10)
                .quantityReserved(2)
                .safetyBuffer(10)
                .build();
    }

    @Test
    void getInventoryOverview_ShouldReturnCorrectTotals() {
        when(productRepository.count()).thenReturn(5L);
        when(variantRepository.count()).thenReturn(10L);
        when(inventoryRepository.findAll()).thenReturn(List.of(inventory));
        when(inventoryRepository.findLowStockInventories()).thenReturn(List.of(inventory));

        InventoryOverviewDto overview = reportingService.getInventoryOverview();

        assertThat(overview.getTotalProducts()).isEqualTo(5);
        assertThat(overview.getTotalVariants()).isEqualTo(10);
        assertThat(overview.getTotalStockOnHand()).isEqualTo(10);
        assertThat(overview.getTotalStockReserved()).isEqualTo(2);
        assertThat(overview.getLowStockVariantCount()).isEqualTo(1);
    }
}
