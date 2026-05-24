package com.cinema.api.controller;

import com.cinema.api.dto.ReceiptRq;
import com.cinema.api.dto.ReceiptRs;
import com.cinema.api.service.ReceiptService;
import com.cinema.api.util.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
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

    @DeleteMapping("/{receiptId}/merchandise/{itemId}")
    public ResponseEntity<Void> removeMerchandise(@PathVariable Long receiptId,
                                                  @PathVariable Long itemId) {
        receiptService.removeMerchandise(receiptId, itemId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{receiptId}/combo/{itemId}")
    public ResponseEntity<Void> removeCombo(@PathVariable Long receiptId,
                                            @PathVariable Long itemId) {
        receiptService.removeCombo(receiptId, itemId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{receiptId}/merchandise/{itemId}")
    public ResponseEntity<Void> updateMerchandiseQuantity(@PathVariable Long receiptId,
                                                          @PathVariable Long itemId,
                                                          @RequestParam Integer quantity) {
        receiptService.updateMerchandiseQuantity(receiptId, itemId, quantity);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{receiptId}/combo/{itemId}")
    public ResponseEntity<Void> updateComboQuantity(@PathVariable Long receiptId,
                                                    @PathVariable Long itemId,
                                                    @RequestParam Integer quantity) {
        receiptService.updateComboQuantity(receiptId, itemId, quantity);
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

    // ========== ПОЛУЧЕНИЕ ЧЕКОВ С ПАГИНАЦИЕЙ ==========
    @GetMapping
    public ResponseEntity<Page<ReceiptRs>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "date"));
        return ResponseEntity.ok(receiptService.getAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReceiptRs> getById(@PathVariable Long id) {
        return ResponseEntity.ok(receiptService.getById(id));
    }

    // ========== ПОЛУЧЕНИЕ ЧЕКОВ ПО ДАТАМ С ПАГИНАЦИЕЙ ==========
    @GetMapping("/report")
    public ResponseEntity<Page<ReceiptRs>> getByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "date"));
        return ResponseEntity.ok(receiptService.getByDateRange(start, end, pageable));
    }
}