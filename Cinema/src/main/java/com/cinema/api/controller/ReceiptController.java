package com.cinema.api.controller;

import com.cinema.api.dto.ReceiptRs;
import com.cinema.api.service.ReceiptService;
import com.cinema.api.util.SecurityUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/receipts")
public class ReceiptController {

    private final ReceiptService receiptService;

    public ReceiptController(ReceiptService receiptService) {
        this.receiptService = receiptService;
    }

    @PostMapping("/draft")
    public ResponseEntity<ReceiptRs> createDraft() {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(receiptService.createReceipt(SecurityUtils.getCurrentAdminId()));
    }

    @PostMapping("/{receiptId}/merchandise")
    public ResponseEntity<Void> addMerchandise(@PathVariable Long receiptId,
                                               @RequestParam Long merchandiseId,
                                               @RequestParam Integer quantity) {
        receiptService.addMerchandise(receiptId, merchandiseId, quantity);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{receiptId}/combo")
    public ResponseEntity<Void> addCombo(@PathVariable Long receiptId,
                                         @RequestParam Long comboId,
                                         @RequestParam Integer quantity) {
        receiptService.addCombo(receiptId, comboId, quantity);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{receiptId}/sell")
    public ResponseEntity<ReceiptRs> sell(@PathVariable Long receiptId,
                                          @RequestParam String paymentMethod) {
        return ResponseEntity.ok(receiptService.sell(receiptId, SecurityUtils.getCurrentAdminId(), paymentMethod));
    }

    @PostMapping("/{receiptId}/cancel")
    public ResponseEntity<ReceiptRs> cancel(@PathVariable Long receiptId) {
        return ResponseEntity.ok(receiptService.cancel(receiptId, SecurityUtils.getCurrentAdminId()));
    }

    @GetMapping
    public ResponseEntity<List<ReceiptRs>> getAll() {
        return ResponseEntity.ok(receiptService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReceiptRs> getById(@PathVariable Long id) {
        return ResponseEntity.ok(receiptService.getById(id));
    }

    @GetMapping("/report")
    public ResponseEntity<List<ReceiptRs>> getByDateRange(@RequestParam LocalDateTime start,
                                                          @RequestParam LocalDateTime end) {
        return ResponseEntity.ok(receiptService.getByDateRange(start, end));
    }
}