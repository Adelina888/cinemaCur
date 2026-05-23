package com.cinema.api.dto;

import jakarta.validation.constraints.*;
import java.util.ArrayList;
import java.util.List;

public class ReceiptRq {

    @NotBlank(message = "Способ оплаты обязателен")
    private String paymentMethod;

    private List<MerchandiseItemDto> merchandiseItems = new ArrayList<>();
    private List<ComboItemDto> comboItems = new ArrayList<>();

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public List<MerchandiseItemDto> getMerchandiseItems() { return merchandiseItems; }
    public void setMerchandiseItems(List<MerchandiseItemDto> merchandiseItems) { this.merchandiseItems = merchandiseItems; }

    public List<ComboItemDto> getComboItems() { return comboItems; }
    public void setComboItems(List<ComboItemDto> comboItems) { this.comboItems = comboItems; }
}