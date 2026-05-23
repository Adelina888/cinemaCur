package com.cinema.api.dto;

import java.util.List;

public class ComboRs {

    private Long id;
    private String name;
    private Double regularPrice;
    private Double comboPrice;
    private Integer discountPercent;
    private String description;
    private Boolean isActive;
    private List<ProductInComboRs> products;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Double getRegularPrice() { return regularPrice; }
    public void setRegularPrice(Double regularPrice) { this.regularPrice = regularPrice; }

    public Double getComboPrice() { return comboPrice; }
    public void setComboPrice(Double comboPrice) { this.comboPrice = comboPrice; }

    public Integer getDiscountPercent() { return discountPercent; }
    public void setDiscountPercent(Integer discountPercent) { this.discountPercent = discountPercent; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public List<ProductInComboRs> getProducts() { return products; }
    public void setProducts(List<ProductInComboRs> products) { this.products = products; }
}