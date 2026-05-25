package com.cinema.api.service;

import com.cinema.api.aspect.LoggerAspect;
import com.cinema.api.dto.ProductRq;
import com.cinema.api.dto.ProductRs;
import com.cinema.api.entity.Product;
import com.cinema.api.enums.Category;
import com.cinema.api.exception.ValidationError;
import com.cinema.api.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final LoggerAspect logger;

    public ProductService(ProductRepository productRepository, LoggerAspect logger) {
        this.productRepository = productRepository;
        this.logger = logger;
    }
    @Transactional(readOnly = true)
    public Page<ProductRs> getAll(Pageable pageable) {
        return productRepository.findAll(pageable).map(this::convertToRs);
    }
    private LocalDate getExpirationDate(Product product) {
        if (product.getExpirationDays() == null || product.getExpirationDays() <= 0) {
            return null;
        }
        return product.getDateOfCreation().plusDays(product.getExpirationDays());
    }

    public boolean isExpired(Product product) {
        LocalDate expDate = getExpirationDate(product);
        if (expDate == null) return false;
        return !expDate.isAfter(LocalDate.now());
    }

    private int getDaysLeft(Product product) {
        LocalDate expDate = getExpirationDate(product);
        if (expDate == null) return Integer.MAX_VALUE;
        return (int) ChronoUnit.DAYS.between(LocalDate.now(), expDate);
    }

    @Transactional
    public ProductRs create(ProductRq rq, Long adminId) {
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
        logger.logProductCreate(adminId, saved.getName());
        return convertToRs(saved);
    }

    @Transactional
    public ProductRs update(Long id, ProductRq rq, Long adminId) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ValidationError("id", "Товар не найден"));

        if (!product.getName().equals(rq.getName()) && productRepository.existsByName(rq.getName())) {
            throw new ValidationError("name", "Товар с таким именем уже существует");
        }
        if (rq.getPrice() <= 0) {
            throw new ValidationError("price", "Цена должна быть больше 0");
        }

        Double oldPrice = product.getPrice();
        product.setName(rq.getName());
        product.setPrice(rq.getPrice());
        product.setCategory(rq.getCategory());
        product.setExpirationDays(rq.getExpirationDays());

        Product updated = productRepository.save(product);

        if (!oldPrice.equals(product.getPrice())) {
            logger.logPriceChange(adminId, id, oldPrice, product.getPrice());
        }
        logger.logProductUpdate(adminId, updated.getName());
        return convertToRs(updated);
    }

    @Transactional
    public void delete(Long id, Long adminId) {
        if (!productRepository.existsById(id)) {
            throw new ValidationError("id", "Товар не найден");
        }
        productRepository.deleteById(id);
        logger.logProductDelete(adminId, id);
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

    @Transactional(readOnly = true)
    public List<Product> getExpiringProducts(int daysThreshold) {
        return productRepository.findAll().stream()
                .filter(p -> {
                    int daysLeft = getDaysLeft(p);
                    return daysLeft > 0 && daysLeft <= daysThreshold;
                })
                .collect(Collectors.toList());
    }
    public List<String> getExpiredProductNames() {
        return productRepository.findExpiredProducts().stream()
                .map(Product::getName)
                .collect(Collectors.toList());
    }

    public List<String> getExpiringSoonProductNames(int daysThreshold) {
        return productRepository.findAll().stream()
                .filter(p -> {
                    int daysLeft = getDaysLeft(p);
                    return daysLeft > 0 && daysLeft <= daysThreshold;
                })
                .map(Product::getName)
                .collect(Collectors.toList());
    }

    //@Scheduled(cron = "0 0 8 * * *")
    public void checkExpiringProducts() {
        List<Product> expiringSoon = getExpiringProducts(3);
        if (expiringSoon.isEmpty()) {
            logger.logExpirationWarning("Нет товаров с истекающим сроком годности", 0);
        } else {
            for (Product product : expiringSoon) {
                int daysLeft = getDaysLeft(product);
                logger.logExpirationWarning(product.getName(), daysLeft);
            }
        }
    }
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