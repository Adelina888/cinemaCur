package com.cinema.api.service;

import com.cinema.api.dto.StockMovementRs;
import com.cinema.api.enums.MovementType;
import com.cinema.api.entity.Product;
import com.cinema.api.entity.StockMovement;
import com.cinema.api.repository.StockMovementRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StockMovementService {

    private final StockMovementRepository movementRepository;

    public StockMovementService(StockMovementRepository movementRepository) {
        this.movementRepository = movementRepository;
    }

    @Transactional
    public void recordMovement(Product product, MovementType type, Integer quantity,
                               String source, String target, Long adminId, String note) {
        StockMovement movement = new StockMovement(product, type, quantity, adminId);
        movement.setSource(source);
        movement.setTarget(target);
        movement.setNote(note);
        movementRepository.save(movement);
    }

    @Transactional(readOnly = true)
    public Page<StockMovementRs> getMovementsByProduct(Long productId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<StockMovement> pageResult = movementRepository.findByProductIdOrderByCreatedAtDesc(productId, pageable);
        return pageResult.map(this::convertToRs);
    }

    private StockMovementRs convertToRs(StockMovement movement) {
        StockMovementRs rs = new StockMovementRs();
        rs.setId(movement.getId());
        rs.setProductName(movement.getProduct().getName());
        rs.setType(movement.getType().name());
        rs.setQuantity(movement.getQuantity());
        rs.setSource(movement.getSource());
        rs.setTarget(movement.getTarget());
        rs.setAdminId(movement.getAdminId());
        rs.setCreatedAt(movement.getCreatedAt());
        rs.setNote(movement.getNote());
        return rs;
    }
}