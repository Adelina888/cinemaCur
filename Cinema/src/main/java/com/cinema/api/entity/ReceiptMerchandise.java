package com.cinema.api.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "receipt_merchandise")
public class ReceiptMerchandise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "receipt_id", nullable = false)
    private Receipt receipt;

    @ManyToOne
    @JoinColumn(name = "merchandise_id", nullable = false)
    private Merchandise merchandise;

    private Integer quantity;

    private Double priceAtMoment;  // цена на момент продажи

    private Double subtotal;        // = quantity * priceAtMoment

    public ReceiptMerchandise() {}

    public ReceiptMerchandise(Receipt receipt, Merchandise merchandise, Integer quantity, Double priceAtMoment) {
        this.receipt = receipt;
        this.merchandise = merchandise;
        this.quantity = quantity;
        this.priceAtMoment = priceAtMoment;
        this.subtotal = quantity * priceAtMoment;
    }

    // Геттеры и сеттеры
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Receipt getReceipt() { return receipt; }
    public void setReceipt(Receipt receipt) { this.receipt = receipt; }

    public Merchandise getMerchandise() { return merchandise; }
    public void setMerchandise(Merchandise merchandise) { this.merchandise = merchandise; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
        this.subtotal = this.priceAtMoment * quantity;
    }

    public Double getPriceAtMoment() { return priceAtMoment; }
    public void setPriceAtMoment(Double priceAtMoment) {
        this.priceAtMoment = priceAtMoment;
        this.subtotal = this.priceAtMoment * this.quantity;
    }

    public Double getSubtotal() { return subtotal; }
    public void setSubtotal(Double subtotal) { this.subtotal = subtotal; }
}