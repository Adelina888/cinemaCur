package com.cinema.api.dto;

import com.cinema.api.enums.MerchandiseType;
import jakarta.validation.constraints.*;

public class MerchandiseRq {

    @NotBlank(message = "Название обязательно")
    @Size(min = 2, max = 100, message = "Название должно быть от 2 до 100 символов")
    private String name;

    @NotNull(message = "Цена обязательна")
    @DecimalMin(value = "0.01", message = "Цена должна быть больше 0")
    @DecimalMax(value = "1000000.00", message = "Цена не может превышать 1 000 000 рублей")
    private Double price;


    private String imageUrl;

    @Min(value = 0, message = "Размер не может быть отрицательным")
    @Max(value = 100, message = "Размер не может превышать 100")
    private Integer size;

    @Size(max = 50, message = "Материал не должен превышать 50 символов")
    private String material;

    @NotNull(message = "Тип обязателен")
    private MerchandiseType type;

    @Min(value = 0, message = "Количество не может быть отрицательным")
    @Max(value = 999999, message = "Количество не может превышать 999 999")
    private Integer count;

    private Integer status;

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

    public Integer getStatus() { return status; }
    public void setStatus(Integer status) { this.status = status; }
}