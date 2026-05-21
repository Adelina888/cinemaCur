package com.cinema.api.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private Double price;

    private String category;

    @Column(name = "expiration_days")
    private Integer expirationDays;   // срок годности в днях, null или 0 – означает "не портится"

    @Column(name = "date_of_creation", nullable = false)
    private LocalDate dateOfCreation;

    private Integer status;  // например, 0 – неактивен, 1 – активен

    // Конструкторы
    public Product() {
        this.dateOfCreation = LocalDate.now();
        this.status = 1;
    }

    public Product(String name, Double price, String category, Integer expirationDays) {
        this();
        this.name = name;
        this.price = price;
        this.category = category;
        this.expirationDays = expirationDays;
    }

    // Геттеры и сеттеры
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Integer getExpirationDays() { return expirationDays; }
    public void setExpirationDays(Integer expirationDays) { this.expirationDays = expirationDays; }

    public LocalDate getDateOfCreation() { return dateOfCreation; }
    public void setDateOfCreation(LocalDate dateOfCreation) { this.dateOfCreation = dateOfCreation; }

    public Integer getStatus() { return status; }
    public void setStatus(Integer status) { this.status = status; }
}