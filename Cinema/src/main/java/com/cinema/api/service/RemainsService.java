package com.cinema.api.service;

import com.cinema.api.aspect.LoggerAspect;
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
    private final LoggerAspect logger;

    public RemainsService(RemainsRepository remainsRepository,
                          ProductRepository productRepository,
                          StockMovementService movementService,
                          LoggerAspect logger) {
        this.remainsRepository = remainsRepository;
        this.productRepository = productRepository;
        this.movementService = movementService;
        this.logger = logger;
    }

    private Remains getOrCreateRemainsForWrite(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ValidationError("productId", "Товар не найден"));
        return remainsRepository.findByProduct(product)
                .orElseGet(() -> remainsRepository.save(new Remains(product)));
    }

    @Transactional(readOnly = true)
    public RemainsRs getByProductId(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ValidationError("productId", "Товар не найден"));
        Remains remains = remainsRepository.findByProduct(product).orElse(null);
        if (remains == null) {
            RemainsRs rs = new RemainsRs();
            rs.setProductId(productId);
            rs.setProductName(product.getName());
            rs.setBar(0);
            rs.setWarehouse(0);
            return rs;
        }
        return convertToRs(remains);
    }

    @Transactional
    public void setWarehouseStock(Long productId, Integer newWarehouse, Long adminId) {
        if (newWarehouse < 0) throw new ValidationError("warehouse", "Не может быть отрицательным");
        Remains remains = getOrCreateRemainsForWrite(productId);
        int oldWarehouse = remains.getWarehouse();
        remains.setWarehouse(newWarehouse);
        remainsRepository.save(remains);

        movementService.recordMovement(remains.getProduct(), MovementType.ADJUST,
                newWarehouse - oldWarehouse, null, "WAREHOUSE", adminId, "Ручная корректировка склада");
        logger.logStockChange(adminId, productId, oldWarehouse, newWarehouse, "WAREHOUSE");
    }

    @Transactional
    public void setBarStock(Long productId, Integer newBar, Long adminId) {
        if (newBar < 0) throw new ValidationError("bar", "Не может быть отрицательным");
        Remains remains = getOrCreateRemainsForWrite(productId);
        int oldBar = remains.getBar();
        remains.setBar(newBar);
        remainsRepository.save(remains);

        movementService.recordMovement(remains.getProduct(), MovementType.ADJUST,
                newBar - oldBar, null, "BAR", adminId, "Ручная корректировка бара");
        logger.logStockChange(adminId, productId, oldBar, newBar, "BAR");
    }

    @Transactional
    public void transferToBar(Long productId, Integer qty, Long adminId) {
        if (qty <= 0) throw new ValidationError("qty", "Количество должно быть положительным");
        Remains remains = getOrCreateRemainsForWrite(productId);
        if (remains.getWarehouse() < qty)
            throw new ValidationError("warehouse", "Недостаточно на складе");
        int oldWarehouse = remains.getWarehouse();
        int oldBar = remains.getBar();
        remains.setWarehouse(remains.getWarehouse() - qty);
        remains.setBar(remains.getBar() + qty);
        remainsRepository.save(remains);

        movementService.recordMovement(remains.getProduct(), MovementType.TRANSFER,
                qty, "WAREHOUSE", "BAR", adminId, null);
        logger.logStockChange(adminId, productId, oldWarehouse, remains.getWarehouse(), "WAREHOUSE");
        logger.logStockChange(adminId, productId, oldBar, remains.getBar(), "BAR");
    }

    @Transactional
    public void decreaseBar(Long productId, Integer qty, Long adminId) {
        if (qty <= 0) throw new ValidationError("qty", "Количество должно быть положительным");
        Remains remains = getOrCreateRemainsForWrite(productId);
        if (remains.getBar() < qty)
            throw new ValidationError("bar", "Недостаточно товара в баре");
        int oldBar = remains.getBar();
        remains.setBar(remains.getBar() - qty);
        remainsRepository.save(remains);

        movementService.recordMovement(remains.getProduct(), MovementType.SALE,
                qty, "BAR", null, adminId, "Продажа");
        logger.logStockChange(adminId, productId, oldBar, remains.getBar(), "BAR");
    }

    @Transactional
    public void increaseBar(Long productId, Integer qty, Long adminId) {
        if (qty <= 0) throw new ValidationError("qty", "Количество должно быть положительным");
        Remains remains = getOrCreateRemainsForWrite(productId);
        int oldBar = remains.getBar();
        remains.setBar(remains.getBar() + qty);
        remainsRepository.save(remains);

        movementService.recordMovement(remains.getProduct(), MovementType.RETURN,
                qty, null, "BAR", adminId, "Возврат");
        logger.logStockChange(adminId, productId, oldBar, remains.getBar(), "BAR");
    }

    @Transactional(readOnly = true)
    public List<RemainsRs> checkLowStock(Integer threshold) {
        return remainsRepository.findAll().stream()
                .filter(r -> r.getBar() < threshold)
                .map(this::convertToRs)
                .collect(Collectors.toList());
    }
    public List<String> getLowStockProductNames(int threshold) {
        return remainsRepository.findAll().stream()
                .filter(r -> r.getBar() < threshold)
                .map(r -> r.getProduct().getName() + " (остаток: " + r.getBar() + " шт)")
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