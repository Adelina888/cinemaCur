package com.cinema.api.service;

import com.cinema.api.aspect.LoggerAspect;
import com.cinema.api.dto.*;
import com.cinema.api.entity.*;
import com.cinema.api.exception.ExpiredProductException;
import com.cinema.api.exception.InsufficientStockException;
import com.cinema.api.exception.ValidationError;
import com.cinema.api.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReceiptService {

    private final ReceiptRepository receiptRepository;
    private final ReceiptMerchandiseRepository receiptMerchandiseRepository;
    private final ReceiptComboRepository receiptComboRepository;
    private final MerchandiseRepository merchandiseRepository;
    private final ComboRepository comboRepository;
    private final RemainsService remainsService;
    private final MerchandiseService merchandiseService;
    private final ProductService productService;
    private final LoggerAspect logger;

    public ReceiptService(ReceiptRepository receiptRepository,
                          ReceiptMerchandiseRepository receiptMerchandiseRepository,
                          ReceiptComboRepository receiptComboRepository,
                          MerchandiseRepository merchandiseRepository,
                          ComboRepository comboRepository,
                          RemainsService remainsService,
                          MerchandiseService merchandiseService,
                          ProductService productService,
                          LoggerAspect logger) {
        this.receiptRepository = receiptRepository;
        this.receiptMerchandiseRepository = receiptMerchandiseRepository;
        this.receiptComboRepository = receiptComboRepository;
        this.merchandiseRepository = merchandiseRepository;
        this.comboRepository = comboRepository;
        this.remainsService = remainsService;
        this.merchandiseService = merchandiseService;
        this.productService = productService;
        this.logger = logger;
    }

    @Transactional
    public ReceiptRs createReceipt(Long adminId) {
        Receipt receipt = new Receipt(adminId);
        receipt.setTypeOfOperation("DRAFT");
        receipt = receiptRepository.save(receipt);
        return convertToRs(receipt);
    }

    @Transactional
    public void removeMerchandise(Long receiptId, Long itemId) {
        // Находим позицию
        ReceiptMerchandise item = receiptMerchandiseRepository.findById(itemId)
                .orElseThrow(() -> new ValidationError("itemId", "Позиция не найдена"));

        // Проверяем принадлежность чеку
        if (!item.getReceipt().getId().equals(receiptId)) {
            throw new ValidationError("receiptId", "Позиция не принадлежит этому чеку");
        }

        // Удаляем позицию
        receiptMerchandiseRepository.delete(item);
        receiptMerchandiseRepository.flush(); // Принудительно выполняем удаление

        // Обновляем итоговую сумму чека
        Receipt receipt = receiptRepository.findById(receiptId)
                .orElseThrow(() -> new ValidationError("receiptId", "Чек не найден"));

        // Пересчитываем сумму без удаленной позиции
        receipt.setTotalAmount(calculateTotal(receipt));
        receiptRepository.save(receipt);
    }

    @Transactional
    public void removeCombo(Long receiptId, Long itemId) {
        // Находим позицию
        ReceiptCombo item = receiptComboRepository.findById(itemId)
                .orElseThrow(() -> new ValidationError("itemId", "Позиция не найдена"));

        // Проверяем принадлежность чеку
        if (!item.getReceipt().getId().equals(receiptId)) {
            throw new ValidationError("receiptId", "Позиция не принадлежит этому чеку");
        }

        // Удаляем позицию
        receiptComboRepository.delete(item);
        receiptComboRepository.flush(); // Принудительно выполняем удаление

        // Обновляем итоговую сумму чека
        Receipt receipt = receiptRepository.findById(receiptId)
                .orElseThrow(() -> new ValidationError("receiptId", "Чек не найден"));

        // Пересчитываем сумму без удаленной позиции
        receipt.setTotalAmount(calculateTotal(receipt));
        receiptRepository.save(receipt);
    }

    @Transactional
    public void updateMerchandiseQuantity(Long receiptId, Long itemId, Integer quantity) {
        if (quantity <= 0) {
            throw new ValidationError("quantity", "Количество должно быть положительным");
        }
        ReceiptMerchandise item = receiptMerchandiseRepository.findById(itemId)
                .orElseThrow(() -> new ValidationError("itemId", "Позиция не найдена"));
        if (!item.getReceipt().getId().equals(receiptId)) {
            throw new ValidationError("receiptId", "Позиция не принадлежит этому чеку");
        }
        item.setQuantity(quantity);
        receiptMerchandiseRepository.save(item);

        Receipt receipt = receiptRepository.findById(receiptId)
                .orElseThrow(() -> new ValidationError("receiptId", "Чек не найден"));
        receipt.setTotalAmount(calculateTotal(receipt));
        receiptRepository.save(receipt);
    }

    @Transactional
    public void updateComboQuantity(Long receiptId, Long itemId, Integer quantity) {
        if (quantity <= 0) {
            throw new ValidationError("quantity", "Количество должно быть положительным");
        }
        ReceiptCombo item = receiptComboRepository.findById(itemId)
                .orElseThrow(() -> new ValidationError("itemId", "Позиция не найдена"));
        if (!item.getReceipt().getId().equals(receiptId)) {
            throw new ValidationError("receiptId", "Позиция не принадлежит этому чеку");
        }
        item.setQuantity(quantity);
        receiptComboRepository.save(item);

        Receipt receipt = receiptRepository.findById(receiptId)
                .orElseThrow(() -> new ValidationError("receiptId", "Чек не найден"));
        receipt.setTotalAmount(calculateTotal(receipt));
        receiptRepository.save(receipt);
    }

    @Transactional(readOnly = true)
    public Page<ReceiptRs> getAll(Pageable pageable) {
        return receiptRepository.findAll(pageable).map(this::convertToRs);
    }

    @Transactional(readOnly = true)
    public Page<ReceiptRs> getByDateRange(LocalDateTime start, LocalDateTime end, Pageable pageable) {
        return receiptRepository.findByDateRange(start, end, pageable).map(this::convertToRs);
    }

    @Transactional
    public void addMerchandise(Long receiptId, Long merchandiseId, Integer quantity) {
        if (quantity <= 0) {
            throw new ValidationError("quantity", "Количество должно быть положительным");
        }
        Receipt receipt = receiptRepository.findById(receiptId)
                .orElseThrow(() -> new ValidationError("receiptId", "Чек не найден"));
        Merchandise merchandise = merchandiseRepository.findById(merchandiseId)
                .orElseThrow(() -> new ValidationError("merchandiseId", "Товар не найден"));

        ReceiptMerchandise rm = new ReceiptMerchandise(receipt, merchandise, quantity, merchandise.getPrice());
        receiptMerchandiseRepository.save(rm);
        receipt.getMerchandiseItems().add(rm);
        receipt.setTotalAmount(calculateTotal(receipt));
        receiptRepository.save(receipt);
    }

    @Transactional
    public void addCombo(Long receiptId, Long comboId, Integer quantity) {
        if (quantity <= 0) {
            throw new ValidationError("quantity", "Количество должно быть положительным");
        }
        Receipt receipt = receiptRepository.findById(receiptId)
                .orElseThrow(() -> new ValidationError("receiptId", "Чек не найден"));
        Combo combo = comboRepository.findById(comboId)
                .orElseThrow(() -> new ValidationError("comboId", "Комбо не найдено"));

        ReceiptCombo rc = new ReceiptCombo(receipt, combo, quantity, combo.getComboPrice());
        receiptComboRepository.save(rc);
        receipt.getComboItems().add(rc);
        receipt.setTotalAmount(calculateTotal(receipt));
        receiptRepository.save(receipt);
    }

    private Double calculateTotal(Receipt receipt) {
        double total = 0.0;
        for (ReceiptMerchandise rm : receipt.getMerchandiseItems()) {
            total += rm.getSubtotal();
        }
        for (ReceiptCombo rc : receipt.getComboItems()) {
            total += rc.getSubtotal();
        }
        return total;
    }

    @Transactional
    public ReceiptRs sell(Long receiptId, Long adminId, String paymentMethod) {
        if (paymentMethod == null || paymentMethod.isBlank()) {
            throw new ValidationError("paymentMethod", "Способ оплаты обязателен");
        }
        if (!paymentMethod.equals("CASH") && !paymentMethod.equals("CARD") && !paymentMethod.equals("ONLINE")) {
            throw new ValidationError("paymentMethod", "Недопустимый способ оплаты");
        }

        Receipt receipt = receiptRepository.findById(receiptId)
                .orElseThrow(() -> new ValidationError("receiptId", "Чек не найден"));

        if ("SALE".equals(receipt.getTypeOfOperation())) {
            throw new ValidationError("receiptId", "Чек уже продан");
        }

        // Проверка и списание для мерча
        for (ReceiptMerchandise rm : receipt.getMerchandiseItems()) {
            Merchandise merch = rm.getMerchandise();
            if (merch.getCount() < rm.getQuantity()) {
                throw new InsufficientStockException("Недостаточно мерча: " + merch.getName());
            }
            merchandiseService.sell(merch.getId(), rm.getQuantity(), adminId);
        }

        // Проверка и списание для комбо
        for (ReceiptCombo rc : receipt.getComboItems()) {
            Combo combo = rc.getCombo();
            for (ComboProduct cp : combo.getComboProducts()) {
                Product product = cp.getProduct();
                int totalQuantity = cp.getQuantity() * rc.getQuantity();

                if (productService.isExpired(product)) {
                    throw new ExpiredProductException("Товар просрочен: " + product.getName());
                }

                remainsService.decreaseBar(product.getId(), totalQuantity, adminId);
            }
        }

        receipt.setTypeOfOperation("SALE");
        receipt.setPaymentMethod(paymentMethod);
        receipt.setTotalAmount(calculateTotal(receipt));
        receiptRepository.save(receipt);

        logger.logSale(adminId, receiptId, receipt.getTotalAmount());
        return convertToRs(receipt);
    }

    @Transactional
    public ReceiptRs cancel(Long originalReceiptId, Long adminId) {
        Receipt originalReceipt = receiptRepository.findById(originalReceiptId)
                .orElseThrow(() -> new ValidationError("receiptId", "Чек не найден"));

        if (!"SALE".equals(originalReceipt.getTypeOfOperation())) {
            throw new ValidationError("receiptId", "Возврат возможен только для проданных чеков");
        }

        boolean alreadyReturned = receiptRepository.existsByOriginalReceiptId(originalReceiptId);
        if (alreadyReturned) {
            throw new ValidationError("receiptId", "Возврат по этому чеку уже был оформлен");
        }

        Receipt returnReceipt = new Receipt(adminId);
        returnReceipt.setTypeOfOperation("RETURN");
        returnReceipt.setPaymentMethod(originalReceipt.getPaymentMethod());
        returnReceipt.setTotalAmount(originalReceipt.getTotalAmount());
        returnReceipt.setOriginalReceiptId(originalReceiptId);
        returnReceipt = receiptRepository.save(returnReceipt);

        for (ReceiptMerchandise rm : originalReceipt.getMerchandiseItems()) {
            ReceiptMerchandise returnRm = new ReceiptMerchandise(
                    returnReceipt,
                    rm.getMerchandise(),
                    rm.getQuantity(),
                    rm.getPriceAtMoment()
            );
            receiptMerchandiseRepository.save(returnRm);
            merchandiseService.increaseCount(rm.getMerchandise().getId(), rm.getQuantity(), adminId);
        }

        for (ReceiptCombo rc : originalReceipt.getComboItems()) {
            ReceiptCombo returnRc = new ReceiptCombo(
                    returnReceipt,
                    rc.getCombo(),
                    rc.getQuantity(),
                    rc.getPriceAtMoment()
            );
            receiptComboRepository.save(returnRc);

            for (ComboProduct cp : rc.getCombo().getComboProducts()) {
                int totalQuantity = cp.getQuantity() * rc.getQuantity();
                remainsService.increaseBar(cp.getProduct().getId(), totalQuantity, adminId);
            }
        }

        logger.logReturn(adminId, originalReceiptId, returnReceipt.getTotalAmount());
        return convertToRs(returnReceipt);
    }

    @Transactional(readOnly = true)
    public List<ReceiptRs> getAll() {
        return receiptRepository.findAll().stream()
                .map(this::convertToRs)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ReceiptRs getById(Long id) {
        Receipt receipt = receiptRepository.findById(id)
                .orElseThrow(() -> new ValidationError("id", "Чек не найден"));
        return convertToRs(receipt);
    }

    @Transactional(readOnly = true)
    public List<ReceiptRs> getByDateRange(LocalDateTime start, LocalDateTime end) {
        return receiptRepository.findByDateRange(start, end).stream()
                .map(this::convertToRs)
                .collect(Collectors.toList());
    }

    private ReceiptRs convertToRs(Receipt receipt) {
        ReceiptRs rs = new ReceiptRs();
        rs.setId(receipt.getId());
        rs.setAdministratorId(receipt.getAdministratorId());
        rs.setDate(receipt.getDate());
        rs.setTotalAmount(receipt.getTotalAmount());
        rs.setPaymentMethod(receipt.getPaymentMethod());
        rs.setTypeOfOperation(receipt.getTypeOfOperation());

        List<MerchandiseItemRs> merchItems = receipt.getMerchandiseItems().stream()
                .map(rm -> {
                    MerchandiseItemRs item = new MerchandiseItemRs();
                    item.setId(rm.getId());
                    item.setMerchandiseId(rm.getMerchandise().getId());
                    item.setMerchandiseName(rm.getMerchandise().getName());
                    item.setPrice(rm.getPriceAtMoment());
                    item.setQuantity(rm.getQuantity());
                    item.setSubtotal(rm.getSubtotal());
                    return item;
                })
                .collect(Collectors.toList());
        rs.setMerchandiseItems(merchItems);

        List<ComboItemRs> comboItems = receipt.getComboItems().stream()
                .map(rc -> {
                    ComboItemRs item = new ComboItemRs();
                    item.setId(rc.getId());
                    item.setComboId(rc.getCombo().getId());
                    item.setComboName(rc.getCombo().getName());
                    item.setPrice(rc.getPriceAtMoment());
                    item.setQuantity(rc.getQuantity());
                    item.setSubtotal(rc.getSubtotal());
                    return item;
                })
                .collect(Collectors.toList());
        rs.setComboItems(comboItems);

        return rs;
    }
}