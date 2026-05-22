package com.cinema.api.service;

import com.cinema.api.dto.MerchandiseRq;
import com.cinema.api.dto.MerchandiseRs;
import com.cinema.api.entity.Merchandise;
import com.cinema.api.enums.MerchandiseType;
import com.cinema.api.exception.ValidationError;
import com.cinema.api.repository.MerchandiseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MerchandiseService {

    private final MerchandiseRepository merchandiseRepository;

    public MerchandiseService(MerchandiseRepository merchandiseRepository) {
        this.merchandiseRepository = merchandiseRepository;
    }

    @Transactional
    public MerchandiseRs create(MerchandiseRq rq) {
        if (merchandiseRepository.existsByName(rq.getName())) {
            throw new ValidationError("name", "Товар с таким названием уже существует");
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
        return convertToRs(saved);
    }

    @Transactional
    public MerchandiseRs update(Long id, MerchandiseRq rq) {
        Merchandise merch = merchandiseRepository.findById(id)
                .orElseThrow(() -> new ValidationError("id", "Товар не найден"));
        if (!merch.getName().equals(rq.getName()) && merchandiseRepository.existsByName(rq.getName())) {
            throw new ValidationError("name", "Товар с таким названием уже существует");
        }
        merch.setName(rq.getName());
        merch.setPrice(rq.getPrice());
        merch.setImageUrl(rq.getImageUrl());
        merch.setSize(rq.getSize());
        merch.setMaterial(rq.getMaterial());
        merch.setType(rq.getType());
        if (rq.getCount() != null) merch.setCount(rq.getCount());
        Merchandise updated = merchandiseRepository.save(merch);
        return convertToRs(updated);
    }

    @Transactional
    public void delete(Long id) {
        if (!merchandiseRepository.existsById(id)) {
            throw new ValidationError("id", "Товар не найден");
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

    public List<MerchandiseRs> filterByType(MerchandiseType type) {
        return merchandiseRepository.findByType(type).stream()
                .map(this::convertToRs)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MerchandiseRs> filterBySize(Integer size) {
        return merchandiseRepository.findBySize(size).stream()
                .map(this::convertToRs)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MerchandiseRs> filterByStatus(Integer status) {
        return merchandiseRepository.findByStatus(status).stream()
                .map(this::convertToRs)
                .collect(Collectors.toList());
    }

    @Transactional
    public void sell(Long id, Integer count) {
        Merchandise merch = merchandiseRepository.findById(id)
                .orElseThrow(() -> new ValidationError("id", "Товар не найден"));
        if (count <= 0) {
            throw new ValidationError("count", "Количество должно быть положительным");
        }
        if (merch.getCount() < count) {
            throw new ValidationError("count", "Недостаточно товара на складе");
        }
        merch.setCount(merch.getCount() - count);
        merchandiseRepository.save(merch);
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