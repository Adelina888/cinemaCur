package com.cinema.api.dto;

import jakarta.validation.constraints.*;
import java.util.ArrayList;
import java.util.List;

public class ComboRq {

    @NotBlank(message = "Название комбо обязательно")
    @Size(min = 2, max = 100)
    private String name;

    @Min(value = 0, message = "Скидка не может быть отрицательной")
    @Max(value = 100, message = "Скидка не может превышать 100%")
    private Integer discountPercent;

    private String description;
    private Boolean isActive = true;

    @NotNull(message = "Товары в комбо обязательны")
    private List<ProductInComboDto> products = new ArrayList<>();

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getDiscountPercent() { return discountPercent; }
    public void setDiscountPercent(Integer discountPercent) { this.discountPercent = discountPercent; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<ProductInComboDto> getProducts() { return products; }
    public void setProducts(List<ProductInComboDto> products) { this.products = products; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}