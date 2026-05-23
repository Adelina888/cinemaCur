package com.cinema.api.controller;

import com.cinema.api.dto.ComboRq;
import com.cinema.api.dto.ComboRs;
import com.cinema.api.service.ComboService;
import com.cinema.api.util.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/combos")
public class ComboController {

    private final ComboService comboService;

    public ComboController(ComboService comboService) {
        this.comboService = comboService;
    }

    @PostMapping
    public ResponseEntity<ComboRs> create(@Valid @RequestBody ComboRq rq) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(comboService.create(rq, SecurityUtils.getCurrentAdminId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ComboRs> update(@PathVariable Long id, @Valid @RequestBody ComboRq rq) {
        return ResponseEntity.ok(comboService.update(id, rq, SecurityUtils.getCurrentAdminId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        comboService.delete(id, SecurityUtils.getCurrentAdminId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<ComboRs>> getAll() {
        return ResponseEntity.ok(comboService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComboRs> getById(@PathVariable Long id) {
        return ResponseEntity.ok(comboService.getById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<ComboRs>> search(@RequestParam(required = false) String name,
                                                @RequestParam(required = false) Boolean isActive) {
        return ResponseEntity.ok(comboService.searchAndFilter(name, isActive));
    }
}