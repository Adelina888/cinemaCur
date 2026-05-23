package com.cinema.api.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "combos")
public class Combo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private Double regularPrice;   // сумма цен товаров без скидки
    private Double comboPrice;     // итоговая цена со скидкой

    private Integer discountPercent;

    private String description;

    private Boolean isActive = true;

    @OneToMany(mappedBy = "combo", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ComboProduct> comboProducts = new ArrayList<>();

    // Конструкторы
    public Combo() {}

    public Combo(String name, Integer discountPercent) {
        this.name = name;
        this.discountPercent = discountPercent;
    }

    // Геттеры и сеттеры
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

    public List<ComboProduct> getComboProducts() { return comboProducts; }
    public void setComboProducts(List<ComboProduct> comboProducts) { this.comboProducts = comboProducts; }
}