package com.cinema.api.service;

import com.cinema.api.dto.RemainsRs;
import com.cinema.api.enums.MovementType;
import com.cinema.api.entity.Product;
import com.cinema.api.entity.Remains;
import com.cinema.api.exception.ValidationError;
import com.cinema.api.repository.ProductRepository;
import com.cinema.api.repository.RemainsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RemainsService {

    private final RemainsRepository remainsRepository;
    private final ProductRepository productRepository;
    private final StockMovementService movementService;

    public RemainsService(RemainsRepository remainsRepository,
                          ProductRepository productRepository,
                          StockMovementService movementService) {
        this.remainsRepository = remainsRepository;
        this.productRepository = productRepository;
        this.movementService = movementService;
    }

    private Remains getOrCreateRemains(Product product) {
        return remainsRepository.findByProduct(product)
                .orElseGet(() -> {
                    Remains newRemains = new Remains(product);
                    return remainsRepository.save(newRemains);
                });
    }

    private Remains getRemainsByProductId(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ValidationError("productId", "Товар не найден"));
        return getOrCreateRemains(product);
    }

    @Transactional(readOnly = true)
    public RemainsRs getByProductId(Long productId) {
        Remains remains = getRemainsByProductId(productId);
        return convertToRs(remains);
    }

    // Ручная установка остатка на складе (приход)
    @Transactional
    public void setWarehouseStock(Long productId, Integer newWarehouse, Long adminId) {
        if (newWarehouse < 0) throw new ValidationError("warehouse", "Не может быть отрицательным");
        Remains remains = getRemainsByProductId(productId);
        int oldWarehouse = remains.getWarehouse();
        remains.setWarehouse(newWarehouse);
        remainsRepository.save(remains);

        movementService.recordMovement(remains.getProduct(), MovementType.ADJUST,
                newWarehouse - oldWarehouse, null, "WAREHOUSE", adminId,
                "Ручная корректировка склада");
    }

    // Ручная установка остатка в баре
    @Transactional
    public void setBarStock(Long productId, Integer newBar, Long adminId) {
        if (newBar < 0) throw new ValidationError("bar", "Не может быть отрицательным");
        Remains remains = getRemainsByProductId(productId);
        int oldBar = remains.getBar();
        remains.setBar(newBar);
        remainsRepository.save(remains);

        movementService.recordMovement(remains.getProduct(), MovementType.ADJUST,
                newBar - oldBar, null, "BAR", adminId,
                "Ручная корректировка бара");
    }

    // Перемещение со склада в бар
    @Transactional
    public void transferToBar(Long productId, Integer qty, Long adminId) {
        if (qty <= 0) throw new ValidationError("qty", "Количество должно быть положительным");
        Remains remains = getRemainsByProductId(productId);
        if (remains.getWarehouse() < qty)
            throw new ValidationError("warehouse", "Недостаточно на складе");
        remains.setWarehouse(remains.getWarehouse() - qty);
        remains.setBar(remains.getBar() + qty);
        remainsRepository.save(remains);

        movementService.recordMovement(remains.getProduct(), MovementType.TRANSFER,
                qty, "WAREHOUSE", "BAR", adminId, null);
    }

    // Продажа (списание из бара) – будет вызываться из ReceiptService
    @Transactional
    public void decreaseBar(Long productId, Integer qty, Long adminId) {
        if (qty <= 0) throw new ValidationError("qty", "Количество должно быть положительным");
        Remains remains = getRemainsByProductId(productId);
        if (remains.getBar() < qty)
            throw new ValidationError("bar", "Недостаточно товара в баре");
        remains.setBar(remains.getBar() - qty);
        remainsRepository.save(remains);

        movementService.recordMovement(remains.getProduct(), MovementType.SALE,
                qty, "BAR", null, adminId, "Продажа");
    }

    // Возврат (приход в бар)
    @Transactional
    public void increaseBar(Long productId, Integer qty, Long adminId) {
        if (qty <= 0) throw new ValidationError("qty", "Количество должно быть положительным");
        Remains remains = getRemainsByProductId(productId);
        remains.setBar(remains.getBar() + qty);
        remainsRepository.save(remains);

        movementService.recordMovement(remains.getProduct(), MovementType.RETURN,
                qty, null, "BAR", adminId, "Возврат");
    }

    // Проверка низких остатков
    @Transactional(readOnly = true)
    public List<RemainsRs> checkLowStock(Integer threshold) {
        return remainsRepository.findAll().stream()
                .filter(r -> r.getBar() < threshold)
                .map(this::convertToRs)
                .collect(Collectors.toList());
    }

    private RemainsRs convertToRs(Remains remains) {
        RemainsRs rs = new RemainsRs();
        rs.setProductId(remains.getProduct().getId());
        rs.setProductName(remains.getProduct().getName());
        rs.setBar(remains.getBar());
        rs.setWarehouse(remains.getWarehouse());
        rs.setLastModified(remains.getLastModified());
        return rs;
    }
}