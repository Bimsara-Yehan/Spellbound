package com.spellbound.reporting;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reporting")
@RequiredArgsConstructor
public class ReportingController {

    private final ReportingService reportingService;

    @GetMapping("/inventory/overview")
    public ResponseEntity<InventoryOverviewDto> getInventoryOverview() {
        return ResponseEntity.ok(reportingService.getInventoryOverview());
    }

    @GetMapping("/inventory/low-stock-alerts")
    public ResponseEntity<List<LowStockAlertDto>> getLowStockAlerts() {
        return ResponseEntity.ok(reportingService.getLowStockAlerts());
    }
}
