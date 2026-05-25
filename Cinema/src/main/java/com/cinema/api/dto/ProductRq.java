package com.cinema.api.dto;

import com.cinema.api.enums.Category;
import jakarta.validation.constraints.*;

public class ProductRq {

    @NotBlank(message = "Название товара обязательно")
    @Size(min = 2, max = 100, message = "Название должно быть от 2 до 100 символов")
    private String name;

    @NotNull(message = "Цена обязательна")
    @DecimalMin(value = "0.01", message = "Цена должна быть больше 0")
    @DecimalMax(value = "1000000.00", message = "Цена не может превышать 1 000 000")
    private Double price;

    @NotNull(message = "Категория обязательна")
    private Category category;

    @Min(value = 0, message = "Срок годности не может быть отрицательным")
    @Max(value = 3650, message = "Срок годности не может превышать 10 лет (3650 дней)")
    private Integer expirationDays;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }

    public Integer getExpirationDays() { return expirationDays; }
    public void setExpirationDays(Integer expirationDays) { this.expirationDays = expirationDays; }
}