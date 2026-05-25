package com.cinema.api.dto;

import com.cinema.api.enums.Category;
import java.time.LocalDate;

public class ProductRs {

    private Long id;
    private String name;
    private Double price;
    private Category category;
    private Integer expirationDays;
    private LocalDate dateOfCreation;
    private Integer status;
    private Integer daysLeft;
    private Boolean isExpired;

    public ProductRs() {}

    public ProductRs(Long id, String name, Double price, Category category,
                     Integer expirationDays, LocalDate dateOfCreation, Integer status,
                     Integer daysLeft, Boolean isExpired) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.category = category;
        this.expirationDays = expirationDays;
        this.dateOfCreation = dateOfCreation;
        this.status = status;
        this.daysLeft = daysLeft;
        this.isExpired = isExpired;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }

    public Integer getExpirationDays() { return expirationDays; }
    public void setExpirationDays(Integer expirationDays) { this.expirationDays = expirationDays; }

    public LocalDate getDateOfCreation() { return dateOfCreation; }
    public void setDateOfCreation(LocalDate dateOfCreation) { this.dateOfCreation = dateOfCreation; }

    public Integer getStatus() { return status; }
    public void setStatus(Integer status) { this.status = status; }

    public Integer getDaysLeft() { return daysLeft; }
    public void setDaysLeft(Integer daysLeft) { this.daysLeft = daysLeft; }

    public Boolean getIsExpired() { return isExpired; }
    public void setIsExpired(Boolean isExpired) { this.isExpired = isExpired; }
}