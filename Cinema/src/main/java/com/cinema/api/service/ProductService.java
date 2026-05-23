package com.cinema.api.service;

import com.cinema.api.dto.ProductRq;
import com.cinema.api.dto.ProductRs;
import com.cinema.api.entity.Product;
import com.cinema.api.enums.Category;
import com.cinema.api.exception.ValidationError;
import com.cinema.api.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    // ===== Вспомогательные методы для срока годности =====
    private LocalDate getExpirationDate(Product product) {
        if (product.getExpirationDays() == null || product.getExpirationDays() <= 0) {
            return null;
        }
        return product.getDateOfCreation().plusDays(product.getExpirationDays());
    }

    public  boolean isExpired(Product product) {
        LocalDate expDate = getExpirationDate(product);
        return expDate != null && expDate.isBefore(LocalDate.now());
    }

    private int getDaysLeft(Product product) {
        LocalDate expDate = getExpirationDate(product);
        if (expDate == null) return Integer.MAX_VALUE;
        return (int) ChronoUnit.DAYS.between(LocalDate.now(), expDate);
    }

    // ===== CRUD =====
    @Transactional
    public ProductRs create(ProductRq rq) {
        if (productRepository.existsByName(rq.getName())) {
            throw new ValidationError("name", "Товар с таким именем уже существует");
        }
        if (rq.getPrice() <= 0) {
            throw new ValidationError("price", "Цена должна быть больше 0");
        }

        Product product = new Product();
        product.setName(rq.getName());
        product.setPrice(rq.getPrice());
        product.setCategory(rq.getCategory());
        product.setExpirationDays(rq.getExpirationDays());
        product.setStatus(1);

        Product saved = productRepository.save(product);
        return convertToRs(saved);
    }

    @Transactional
    public ProductRs update(Long id, ProductRq rq) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ValidationError("id", "Товар не найден"));

        if (!product.getName().equals(rq.getName()) && productRepository.existsByName(rq.getName())) {
            throw new ValidationError("name", "Товар с таким именем уже существует");
        }
        if (rq.getPrice() <= 0) {
            throw new ValidationError("price", "Цена должна быть больше 0");
        }

        product.setName(rq.getName());
        product.setPrice(rq.getPrice());
        product.setCategory(rq.getCategory());
        product.setExpirationDays(rq.getExpirationDays());

        Product updated = productRepository.save(product);
        return convertToRs(updated);
    }

    @Transactional
    public void delete(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ValidationError("id", "Товар не найден"));
        productRepository.delete(product);
    }

    @Transactional(readOnly = true)
    public List<ProductRs> getAll() {
        return productRepository.findAll().stream()
                .map(this::convertToRs)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductRs getById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ValidationError("id", "Товар не найден"));
        return convertToRs(product);
    }

    @Transactional(readOnly = true)
    public List<ProductRs> searchByName(String name) {
        return productRepository.findByNameContainingIgnoreCase(name).stream()
                .map(this::convertToRs)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductRs> filterByCategory(Category category) {
        if (category == null) {
            return getAll();
        }
        return productRepository.findByCategory(category).stream()
                .map(this::convertToRs)
                .collect(Collectors.toList());
    }

    public List<ProductRs> getExpiredProducts() {
        return productRepository.findExpiredProducts().stream()
                .map(this::convertToRs)
                .collect(Collectors.toList());
    }

    // ===== Конвертация =====
    private ProductRs convertToRs(Product product) {
        return new ProductRs(
                product.getId(),
                product.getName(),
                product.getPrice(),
                product.getCategory(),
                product.getExpirationDays(),
                product.getDateOfCreation(),
                product.getStatus(),
                getDaysLeft(product),
                isExpired(product)
        );
    }
}