package com.cinema.api.dto;

import java.time.LocalDateTime;

public class SalesReportDto {
    private Long receiptId;
    private LocalDateTime date;
    private String paymentMethod;
    private Double totalAmount;

    public SalesReportDto() {}

    public SalesReportDto(Long receiptId, LocalDateTime date, String paymentMethod, Double totalAmount) {
        this.receiptId = receiptId;
        this.date = date;
        this.paymentMethod = paymentMethod;
        this.totalAmount = totalAmount;
    }

    // Геттеры и сеттеры
    public Long getReceiptId() { return receiptId; }
    public void setReceiptId(Long receiptId) { this.receiptId = receiptId; }

    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }
}