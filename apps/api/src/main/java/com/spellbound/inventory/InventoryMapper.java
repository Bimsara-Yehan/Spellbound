package com.spellbound.inventory;

import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface InventoryMapper {

    InventoryDto toDto(Inventory inventory);

    StockAdjustmentAuditDto toAuditDto(StockAdjustmentAudit audit);
}
