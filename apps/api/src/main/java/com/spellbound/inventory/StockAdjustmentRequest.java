package com.spellbound.inventory;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockAdjustmentRequest {

    @NotNull(message = "New quantity is required")
    private Integer newQuantity;

    private Integer safetyBuffer;

    @NotBlank(message = "Actor is required")
    private String actor;

    @NotBlank(message = "Reason is required")
    private String reason;
}
