package com.cinema.api.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "remains")
public class Remains {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "product_id", nullable = false, unique = true)
    private Product product;

    private Integer bar;        // остаток в баре
    private Integer warehouse;  // остаток на складе

    private LocalDateTime lastModified;  // дата последнего изменения

    public Remains() {
        this.bar = 0;
        this.warehouse = 0;
        this.lastModified = LocalDateTime.now();
    }

    public Remains(Product product) {
        this();
        this.product = product;
    }

    // геттеры и сеттеры
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public Integer getBar() { return bar; }
    public void setBar(Integer bar) { this.bar = bar; this.lastModified = LocalDateTime.now(); }

    public Integer getWarehouse() { return warehouse; }
    public void setWarehouse(Integer warehouse) { this.warehouse = warehouse; this.lastModified = LocalDateTime.now(); }

    public LocalDateTime getLastModified() { return lastModified; }
    public void setLastModified(LocalDateTime lastModified) { this.lastModified = lastModified; }
}