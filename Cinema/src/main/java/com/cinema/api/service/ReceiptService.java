package com.cinema.api.service;

import com.cinema.api.aspect.LoggerAspect;
import com.cinema.api.dto.*;
import com.cinema.api.entity.*;
import com.cinema.api.exception.ExpiredProductException;
import com.cinema.api.exception.InsufficientStockException;
import com.cinema.api.exception.ValidationError;
import com.cinema.api.repository.*;
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
        receipt = receiptRepository.save(receipt);
        return convertToRs(receipt);
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
    public ReceiptRs cancel(Long receiptId, Long adminId) {
        Receipt receipt = receiptRepository.findById(receiptId)
                .orElseThrow(() -> new ValidationError("receiptId", "Чек не найден"));

        if (!"SALE".equals(receipt.getTypeOfOperation())) {
            throw new ValidationError("receiptId", "Возврат возможен только для проданных чеков");
        }

        // Восстановление для мерча
        for (ReceiptMerchandise rm : receipt.getMerchandiseItems()) {
            merchandiseService.increaseCount(rm.getMerchandise().getId(), rm.getQuantity(), adminId);
        }

        // Восстановление для комбо
        for (ReceiptCombo rc : receipt.getComboItems()) {
            Combo combo = rc.getCombo();
            for (ComboProduct cp : combo.getComboProducts()) {
                Product product = cp.getProduct();
                int totalQuantity = cp.getQuantity() * rc.getQuantity();
                remainsService.increaseBar(product.getId(), totalQuantity, adminId);
            }
        }

        receipt.setTypeOfOperation("RETURN");
        receiptRepository.save(receipt);

        logger.logReturn(adminId, receiptId, receipt.getTotalAmount());
        return convertToRs(receipt);
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