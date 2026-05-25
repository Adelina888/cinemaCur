package com.cinema.api.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
@Table(name = "receipt_combo")
public class ReceiptCombo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receipt_id")
    @JsonBackReference
    private Receipt receipt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "combo_id")
    private Combo combo;

    private Integer quantity;
    private Double priceAtMoment;
    private Double subtotal;

    public ReceiptCombo() {
    }

    public ReceiptCombo(Receipt receipt, Combo combo, Integer quantity, Double priceAtMoment) {
        this.receipt = receipt;
        this.combo = combo;
        this.quantity = quantity;
        this.priceAtMoment = priceAtMoment;
        this.subtotal = priceAtMoment * quantity;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Receipt getReceipt() { return receipt; }
    public void setReceipt(Receipt receipt) { this.receipt = receipt; }

    public Combo getCombo() { return combo; }
    public void setCombo(Combo combo) { this.combo = combo; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
        this.subtotal = this.priceAtMoment * quantity;
    }

    public Double getPriceAtMoment() { return priceAtMoment; }
    public void setPriceAtMoment(Double priceAtMoment) { this.priceAtMoment = priceAtMoment; }

    public Double getSubtotal() { return subtotal; }
    public void setSubtotal(Double subtotal) { this.subtotal = subtotal; }
}