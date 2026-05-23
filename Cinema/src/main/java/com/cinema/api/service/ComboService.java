package com.cinema.api.service;

import com.cinema.api.dto.ComboRq;
import com.cinema.api.dto.ComboRs;
import com.cinema.api.dto.ProductInComboDto;
import com.cinema.api.dto.ProductInComboRs;
import com.cinema.api.entity.Combo;
import com.cinema.api.entity.ComboProduct;
import com.cinema.api.entity.Product;
import com.cinema.api.exception.ValidationError;
import com.cinema.api.repository.ComboProductRepository;
import com.cinema.api.repository.ComboRepository;
import com.cinema.api.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ComboService {

    private final ComboRepository comboRepository;
    private final ComboProductRepository comboProductRepository;
    private final ProductRepository productRepository;

    public ComboService(ComboRepository comboRepository,
                        ComboProductRepository comboProductRepository,
                        ProductRepository productRepository) {
        this.comboRepository = comboRepository;
        this.comboProductRepository = comboProductRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public ComboRs create(ComboRq rq) {
        if (comboRepository.existsByName(rq.getName())) {
            throw new ValidationError("name", "Комбо с таким названием уже существует");
        }
        if (rq.getProducts().isEmpty()) {
            throw new ValidationError("products", "Комбо должно содержать хотя бы один товар");
        }

        Combo combo = new Combo(rq.getName(), rq.getDiscountPercent());
        combo.setDescription(rq.getDescription());
        combo.setRegularPrice(0.0);
        combo.setComboPrice(0.0);
        combo = comboRepository.save(combo);

        double regularSum = 0.0;
        for (ProductInComboDto item : rq.getProducts()) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new ValidationError("productId", "Товар не найден: " + item.getProductId()));
            regularSum += product.getPrice() * item.getQuantity();

            ComboProduct comboProduct = new ComboProduct(combo, product, item.getQuantity());
            comboProductRepository.save(comboProduct);
        }

        combo.setRegularPrice(regularSum);
        combo.setComboPrice(regularSum * (100 - rq.getDiscountPercent()) / 100.0);
        combo = comboRepository.save(combo);

        return convertToRs(combo);
    }

    @Transactional
    public ComboRs update(Long id, ComboRq rq) {
        Combo combo = comboRepository.findById(id)
                .orElseThrow(() -> new ValidationError("id", "Комбо не найдено"));
        if (!combo.getName().equals(rq.getName()) && comboRepository.existsByName(rq.getName())) {
            throw new ValidationError("name", "Комбо с таким названием уже существует");
        }
        if (rq.getProducts().isEmpty()) {
            throw new ValidationError("products", "Комбо должно содержать хотя бы один товар");
        }

        combo.setName(rq.getName());
        combo.setDiscountPercent(rq.getDiscountPercent());
        combo.setDescription(rq.getDescription());

        comboProductRepository.deleteByComboId(id);
        combo.getComboProducts().clear();

        double regularSum = 0.0;
        for (ProductInComboDto item : rq.getProducts()) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new ValidationError("productId", "Товар не найден: " + item.getProductId()));
            regularSum += product.getPrice() * item.getQuantity();

            ComboProduct comboProduct = new ComboProduct(combo, product, item.getQuantity());
            comboProductRepository.save(comboProduct);
            combo.getComboProducts().add(comboProduct);
        }

        combo.setRegularPrice(regularSum);
        combo.setComboPrice(regularSum * (100 - rq.getDiscountPercent()) / 100.0);
        combo = comboRepository.save(combo);

        return convertToRs(combo);
    }

    @Transactional
    public void delete(Long id) {
        if (!comboRepository.existsById(id)) {
            throw new ValidationError("id", "Комбо не найдено");
        }
        comboProductRepository.deleteByComboId(id);
        comboRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<ComboRs> getAll() {
        return comboRepository.findAll().stream()
                .map(this::convertToRs)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ComboRs getById(Long id) {
        Combo combo = comboRepository.findById(id)
                .orElseThrow(() -> new ValidationError("id", "Комбо не найдено"));
        return convertToRs(combo);
    }

    @Transactional(readOnly = true)
    public List<ComboRs> searchByName(String name) {
        return comboRepository.findByNameContainingIgnoreCase(name).stream()
                .map(this::convertToRs)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ComboRs> filterByActive(Boolean isActive) {
        if (isActive == null) {
            return getAll();
        }
        return comboRepository.findByIsActive(isActive).stream()
                .map(this::convertToRs)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ComboRs> searchAndFilter(String name, Boolean isActive) {
        if (name != null && isActive != null) {
            return comboRepository.findByNameContainingIgnoreCaseAndIsActive(name, isActive).stream()
                    .map(this::convertToRs)
                    .collect(Collectors.toList());
        } else if (name != null) {
            return searchByName(name);
        } else if (isActive != null) {
            return filterByActive(isActive);
        } else {
            return getAll();
        }
    }

    private ComboRs convertToRs(Combo combo) {
        ComboRs rs = new ComboRs();
        rs.setId(combo.getId());
        rs.setName(combo.getName());
        rs.setRegularPrice(combo.getRegularPrice());
        rs.setComboPrice(combo.getComboPrice());
        rs.setDiscountPercent(combo.getDiscountPercent());
        rs.setDescription(combo.getDescription());
        rs.setIsActive(combo.getIsActive());

        List<ProductInComboRs> products = combo.getComboProducts().stream()
                .map(cp -> {
                    ProductInComboRs p = new ProductInComboRs();
                    p.setProductId(cp.getProduct().getId());
                    p.setProductName(cp.getProduct().getName());
                    p.setPrice(cp.getProduct().getPrice());
                    p.setQuantity(cp.getQuantity());
                    return p;
                })
                .collect(Collectors.toList());
        rs.setProducts(products);
        return rs;
    }
}