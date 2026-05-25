package com.cinema.api.service;

import com.cinema.api.aspect.LoggerAspect;
import com.cinema.api.dto.MerchandiseRq;
import com.cinema.api.dto.MerchandiseRs;
import com.cinema.api.entity.Merchandise;
import com.cinema.api.enums.MerchandiseType;
import com.cinema.api.exception.InsufficientStockException;
import com.cinema.api.exception.ValidationError;
import com.cinema.api.repository.MerchandiseRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;
import com.cinema.api.repository.ReceiptMerchandiseRepository;

@Service
public class MerchandiseService {

    private final MerchandiseRepository merchandiseRepository;
    private final ReceiptMerchandiseRepository receiptMerchandiseRepository;
    private final LoggerAspect logger;

    public MerchandiseService(MerchandiseRepository merchandiseRepository,
                              ReceiptMerchandiseRepository receiptMerchandiseRepository,
                              LoggerAspect logger) {
        this.merchandiseRepository = merchandiseRepository;
        this.receiptMerchandiseRepository = receiptMerchandiseRepository;
        this.logger = logger;
    }
    @Transactional(readOnly = true)
    public Page<MerchandiseRs> getAll(Pageable pageable) {
        return merchandiseRepository.findAll(pageable).map(this::convertToRs);
    }

    @Transactional
    public MerchandiseRs create(MerchandiseRq rq, Long adminId) {
        if (merchandiseRepository.existsByName(rq.getName())) {
            throw new ValidationError("name", "Товар с таким названием уже существует");
        }
        if (rq.getPrice() <= 0) {
            throw new ValidationError("price", "Цена должна быть больше 0");
        }

        Merchandise merch = new Merchandise();
        merch.setName(rq.getName());
        merch.setPrice(rq.getPrice());
        merch.setImageUrl(rq.getImageUrl());
        merch.setSize(rq.getSize());
        merch.setMaterial(rq.getMaterial());
        merch.setType(rq.getType());
        merch.setCount(rq.getCount() != null ? rq.getCount() : 0);
        merch.setStatus(1);

        Merchandise saved = merchandiseRepository.save(merch);
        logger.logProductCreate(adminId, saved.getName());
        return convertToRs(saved);
    }

    @Transactional
    public MerchandiseRs update(Long id, MerchandiseRq rq, Long adminId) {
        Merchandise merch = merchandiseRepository.findById(id)
                .orElseThrow(() -> new ValidationError("id", "Товар не найден"));
        if (!merch.getName().equals(rq.getName()) && merchandiseRepository.existsByName(rq.getName())) {
            throw new ValidationError("name", "Товар с таким названием уже существует");
        }

        Double oldPrice = merch.getPrice();
        merch.setName(rq.getName());
        merch.setPrice(rq.getPrice());
        merch.setImageUrl(rq.getImageUrl());
        merch.setSize(rq.getSize());
        merch.setMaterial(rq.getMaterial());
        merch.setType(rq.getType());
        if (rq.getCount() != null) merch.setCount(rq.getCount());
        if (rq.getStatus() != null) {
            merch.setStatus(rq.getStatus());
        }

        Merchandise updated = merchandiseRepository.save(merch);

        if (!oldPrice.equals(merch.getPrice())) {
            logger.logPriceChange(adminId, id, oldPrice, merch.getPrice());
        }
        logger.logProductUpdate(adminId, updated.getName());
        return convertToRs(updated);
    }

    @Transactional
    public void delete(Long id, Long adminId) {
        Merchandise merch = merchandiseRepository.findById(id)
                .orElseThrow(() -> new ValidationError("id", "Товар не найден"));
        merch.setStatus(0);
        merchandiseRepository.save(merch);
        logger.logProductDelete(adminId, id);
    }
    @Transactional
    public void hardDelete(Long id) {
        Merchandise merch = merchandiseRepository.findById(id)
                .orElseThrow(() -> new ValidationError("id", "Товар не найден"));

        if (receiptMerchandiseRepository.existsByMerchandiseId(id)) {
            throw new ValidationError("id", "Нельзя удалить товар, который уже был в чеках");
        }

        merchandiseRepository.deleteById(id);
    }
    @Transactional(readOnly = true)
    public List<MerchandiseRs> getAll() {
        return merchandiseRepository.findAll().stream()
                .map(this::convertToRs)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MerchandiseRs getById(Long id) {
        Merchandise merch = merchandiseRepository.findById(id)
                .orElseThrow(() -> new ValidationError("id", "Товар не найден"));
        return convertToRs(merch);
    }

    @Transactional(readOnly = true)
    public List<MerchandiseRs> searchByName(String name) {
        return merchandiseRepository.findByNameContainingIgnoreCase(name).stream()
                .map(this::convertToRs)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MerchandiseRs> filterByType(MerchandiseType type) {
        return merchandiseRepository.findByType(type).stream()
                .map(this::convertToRs)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MerchandiseRs> filterBySize(Integer size) {
        if (size == null) return getAll();
        return merchandiseRepository.findBySize(size).stream()
                .map(this::convertToRs)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MerchandiseRs> filterByStatus(Integer status) {
        if (status == null) return getAll();
        return merchandiseRepository.findByStatus(status).stream()
                .map(this::convertToRs)
                .collect(Collectors.toList());
    }

    @Transactional
    public void sell(Long id, Integer quantity, Long adminId) {
        if (quantity <= 0) throw new ValidationError("quantity", "Количество должно быть положительным");
        Merchandise merch = merchandiseRepository.findById(id)
                .orElseThrow(() -> new ValidationError("id", "Товар не найден"));
        if (merch.getCount() < quantity) {
            throw new InsufficientStockException("Недостаточно товара: " + merch.getName());
        }
        int oldCount = merch.getCount();
        merch.setCount(merch.getCount() - quantity);
        merchandiseRepository.save(merch);
        logger.logStockChange(adminId, id, oldCount, merch.getCount(), "MERCHANDISE");
    }

    @Transactional
    public void increaseCount(Long id, Integer quantity, Long adminId) {
        if (quantity <= 0) throw new ValidationError("quantity", "Количество должно быть положительным");
        Merchandise merch = merchandiseRepository.findById(id)
                .orElseThrow(() -> new ValidationError("id", "Товар не найден"));
        int oldCount = merch.getCount();
        merch.setCount(merch.getCount() + quantity);
        merchandiseRepository.save(merch);
        logger.logStockChange(adminId, id, oldCount, merch.getCount(), "MERCHANDISE");
    }

    private MerchandiseRs convertToRs(Merchandise entity) {
        MerchandiseRs rs = new MerchandiseRs();
        rs.setId(entity.getId());
        rs.setName(entity.getName());
        rs.setPrice(entity.getPrice());
        rs.setImageUrl(entity.getImageUrl());
        rs.setSize(entity.getSize());
        rs.setMaterial(entity.getMaterial());
        rs.setType(entity.getType());
        rs.setCount(entity.getCount());
        rs.setStatus(entity.getStatus());
        return rs;
    }
}