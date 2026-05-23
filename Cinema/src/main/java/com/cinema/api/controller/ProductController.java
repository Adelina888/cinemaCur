package com.cinema.api.controller;

import com.cinema.api.dto.ProductRq;
import com.cinema.api.dto.ProductRs;
import com.cinema.api.enums.Category;
import com.cinema.api.service.ProductService;
import com.cinema.api.util.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping
    public ResponseEntity<ProductRs> create(@Valid @RequestBody ProductRq rq) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(productService.create(rq, SecurityUtils.getCurrentAdminId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductRs> update(@PathVariable Long id, @Valid @RequestBody ProductRq rq) {
        return ResponseEntity.ok(productService.update(id, rq, SecurityUtils.getCurrentAdminId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productService.delete(id, SecurityUtils.getCurrentAdminId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<ProductRs>> getAll() {
        return ResponseEntity.ok(productService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductRs> getById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProductRs>> search(@RequestParam String name) {
        return ResponseEntity.ok(productService.searchByName(name));
    }

    @GetMapping("/filter")
    public ResponseEntity<List<ProductRs>> filter(@RequestParam(required = false) Category category) {
        return ResponseEntity.ok(productService.filterByCategory(category));
    }

    @GetMapping("/expired")
    public ResponseEntity<List<ProductRs>> getExpired() {
        return ResponseEntity.ok(productService.getExpiredProducts());
    }
}