package com.cinema.api.controller;

import com.cinema.api.dto.MerchandiseRq;
import com.cinema.api.dto.MerchandiseRs;
import com.cinema.api.enums.MerchandiseType;
import com.cinema.api.service.MerchandiseService;
import com.cinema.api.util.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/merchandise")
public class MerchandiseController {

    private final MerchandiseService merchandiseService;

    public MerchandiseController(MerchandiseService merchandiseService) {
        this.merchandiseService = merchandiseService;
    }

    @PostMapping
    public ResponseEntity<MerchandiseRs> create(@Valid @RequestBody MerchandiseRq rq) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(merchandiseService.create(rq, SecurityUtils.getCurrentAdminId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MerchandiseRs> update(@PathVariable Long id, @Valid @RequestBody MerchandiseRq rq) {
        return ResponseEntity.ok(merchandiseService.update(id, rq, SecurityUtils.getCurrentAdminId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        merchandiseService.delete(id, SecurityUtils.getCurrentAdminId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<MerchandiseRs>> getAll() {
        return ResponseEntity.ok(merchandiseService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MerchandiseRs> getById(@PathVariable Long id) {
        return ResponseEntity.ok(merchandiseService.getById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<MerchandiseRs>> search(@RequestParam String name) {
        return ResponseEntity.ok(merchandiseService.searchByName(name));
    }

    @GetMapping("/filter")
    public ResponseEntity<List<MerchandiseRs>> filter(
            @RequestParam(required = false) MerchandiseType type,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) Integer status) {
        if (type != null) return ResponseEntity.ok(merchandiseService.filterByType(type));
        if (size != null) return ResponseEntity.ok(merchandiseService.filterBySize(size));
        if (status != null) return ResponseEntity.ok(merchandiseService.filterByStatus(status));
        return ResponseEntity.ok(merchandiseService.getAll());
    }

    @PostMapping("/{id}/sell")
    public ResponseEntity<Void> sell(@PathVariable Long id, @RequestParam Integer count) {
        merchandiseService.sell(id, count, SecurityUtils.getCurrentAdminId());
        return ResponseEntity.noContent().build();
    }
}