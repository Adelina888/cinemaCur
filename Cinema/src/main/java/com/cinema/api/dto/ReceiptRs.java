package com.cinema.api.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ReceiptRs {

    private Long id;
    private Long administratorId;
    private LocalDateTime date;
    private Double totalAmount;
    private String paymentMethod;
    private String typeOfOperation;
    private List<MerchandiseItemRs> merchandiseItems;
    private List<ComboItemRs> comboItems;

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

    public List<MerchandiseItemRs> getMerchandiseItems() { return merchandiseItems; }
    public void setMerchandiseItems(List<MerchandiseItemRs> merchandiseItems) { this.merchandiseItems = merchandiseItems; }

    public List<ComboItemRs> getComboItems() { return comboItems; }
    public void setComboItems(List<ComboItemRs> comboItems) { this.comboItems = comboItems; }
}