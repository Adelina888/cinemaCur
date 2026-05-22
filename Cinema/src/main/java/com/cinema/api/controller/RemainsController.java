package com.cinema.api.controller;

import com.cinema.api.dto.RemainsRs;
import com.cinema.api.dto.StockMovementRs;
import com.cinema.api.service.RemainsService;
import com.cinema.api.service.StockMovementService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/remains")
public class RemainsController {

    private final RemainsService remainsService;
    private final StockMovementService movementService;

    public RemainsController(RemainsService remainsService, StockMovementService movementService) {
        this.remainsService = remainsService;
        this.movementService = movementService;
    }

    private Long getCurrentAdminId() {
        // Временная заглушка – позже получите из SecurityContextHolder
        return 1L;
    }

    @GetMapping("/{productId}")
    public ResponseEntity<RemainsRs> getByProductId(@PathVariable Long productId) {
        return ResponseEntity.ok(remainsService.getByProductId(productId));
    }

    @PutMapping("/{productId}/warehouse")
    public ResponseEntity<Void> setWarehouse(@PathVariable Long productId, @RequestParam Integer qty) {
        remainsService.setWarehouseStock(productId, qty, getCurrentAdminId());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{productId}/bar")
    public ResponseEntity<Void> setBar(@PathVariable Long productId, @RequestParam Integer qty) {
        remainsService.setBarStock(productId, qty, getCurrentAdminId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{productId}/transfer")
    public ResponseEntity<Void> transferToBar(@PathVariable Long productId, @RequestParam Integer qty) {
        remainsService.transferToBar(productId, qty, getCurrentAdminId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<RemainsRs>> lowStock(@RequestParam(defaultValue = "5") Integer threshold) {
        return ResponseEntity.ok(remainsService.checkLowStock(threshold));
    }

    @GetMapping("/{productId}/movements")
    public ResponseEntity<Page<StockMovementRs>> getMovements(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(movementService.getMovementsByProduct(productId, page, size));
    }
}