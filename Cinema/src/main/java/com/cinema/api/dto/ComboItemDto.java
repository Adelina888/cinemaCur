package com.cinema.api.dto;

import jakarta.validation.constraints.*;

public class ComboItemDto {

    @NotNull(message = "ID комбо обязателен")
    private Long comboId;

    @NotNull(message = "Количество обязательно")
    @Min(value = 1, message = "Количество должно быть не менее 1")
    private Integer quantity;

    public Long getComboId() { return comboId; }
    public void setComboId(Long comboId) { this.comboId = comboId; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}