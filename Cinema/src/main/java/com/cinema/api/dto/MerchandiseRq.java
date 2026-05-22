package com.cinema.api.dto;

import com.cinema.api.enums.MerchandiseType;
import jakarta.validation.constraints.*;

public class MerchandiseRq {

    @NotBlank(message = "Название обязательно")
    @Size(min = 2, max = 100)
    private String name;

    @NotNull(message = "Цена обязательна")
    @DecimalMin(value = "0.01")
    private Double price;

    private String imageUrl;

    @Min(value = 0, message = "Размер не может быть отрицательным")
    private Integer size;

    private String material;

    @NotNull(message = "Тип обязателен")
    private MerchandiseType type;

    @Min(value = 0, message = "Количество не может быть отрицательным")
    private Integer count;

    // геттеры и сеттеры
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Integer getSize() { return size; }
    public void setSize(Integer size) { this.size = size; }

    public String getMaterial() { return material; }
    public void setMaterial(String material) { this.material = material; }

    public MerchandiseType getType() { return type; }
    public void setType(MerchandiseType type) { this.type = type; }

    public Integer getCount() { return count; }
    public void setCount(Integer count) { this.count = count; }
}