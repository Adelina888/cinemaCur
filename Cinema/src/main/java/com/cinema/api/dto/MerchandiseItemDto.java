package com.cinema.api.dto;

import jakarta.validation.constraints.*;

public class MerchandiseItemDto {

    @NotNull(message = "ID товара обязателен")
    private Long merchandiseId;

    @NotNull(message = "Количество обязательно")
    @Min(value = 1, message = "Количество должно быть не менее 1")
    private Integer quantity;

    public Long getMerchandiseId() { return merchandiseId; }
    public void setMerchandiseId(Long merchandiseId) { this.merchandiseId = merchandiseId; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}