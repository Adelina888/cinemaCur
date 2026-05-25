package com.cinema.api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "receipts")
public class Receipt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long administratorId;

    private LocalDateTime date;

    private Double totalAmount;

    private String paymentMethod;

    private String typeOfOperation;
    private Long originalReceiptId;

    @OneToMany(mappedBy = "receipt", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ReceiptMerchandise> merchandiseItems = new ArrayList<>();

    @OneToMany(mappedBy = "receipt", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<ReceiptCombo> comboItems = new ArrayList<>();

    public Receipt() {
        this.date = LocalDateTime.now();
        this.totalAmount = 0.0;
    }

    public Receipt(Long administratorId) {
        this();
        this.administratorId = administratorId;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getAdministratorId() { return administratorId; }
    public void setAdministratorId(Long administratorId) { this.administratorId = administratorId; }

    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getTypeOfOperation() { return typeOfOperation; }
    public void setTypeOfOperation(String typeOfOperation) { this.typeOfOperation = typeOfOperation; }

    public Long getOriginalReceiptId() { return originalReceiptId; }
    public void setOriginalReceiptId(Long originalReceiptId) { this.originalReceiptId = originalReceiptId; }

    public List<ReceiptMerchandise> getMerchandiseItems() { return merchandiseItems; }
    public void setMerchandiseItems(List<ReceiptMerchandise> merchandiseItems) { this.merchandiseItems = merchandiseItems; }

    public List<ReceiptCombo> getComboItems() { return comboItems; }
    public void setComboItems(List<ReceiptCombo> comboItems) { this.comboItems = comboItems; }
}