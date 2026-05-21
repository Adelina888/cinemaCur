package com.cinema.api.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

public class ProductRq {

    @NotBlank(message = "Название товара обязательно")
    @Size(min = 2, max = 100, message = "Название должно быть от 2 до 100 символов")
    private String name;

    @NotNull(message = "Цена обязательна")
    @DecimalMin(value = "0.01", message = "Цена должна быть больше 0")
    @DecimalMax(value = "1000000.00", message = "Цена не может превышать 1 000 000")
    private Double price;

    private String category;

    @Min(value = 0, message = "Срок годности не может быть отрицательным")
    @Max(value = 3650, message = "Срок годности не может превышать 10 лет (3650 дней)")
    private Integer expirationDays;  // null или 0 – товар не портится

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Integer getExpirationDays() { return expirationDays; }
    public void setExpirationDays(Integer expirationDays) { this.expirationDays = expirationDays; }
}