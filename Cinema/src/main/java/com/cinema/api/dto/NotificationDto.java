package com.cinema.api.dto;

import java.util.List;

public class NotificationDto {
    private List<String> expiredProducts;
    private List<String> expiringSoonProducts;
    private List<String> lowStockProducts;

    public NotificationDto() {}

    public NotificationDto(List<String> expiredProducts, List<String> expiringSoonProducts, List<String> lowStockProducts) {
        this.expiredProducts = expiredProducts;
        this.expiringSoonProducts = expiringSoonProducts;
        this.lowStockProducts = lowStockProducts;
    }

    // Геттеры и сеттеры
    public List<String> getExpiredProducts() { return expiredProducts; }
    public void setExpiredProducts(List<String> expiredProducts) { this.expiredProducts = expiredProducts; }

    public List<String> getExpiringSoonProducts() { return expiringSoonProducts; }
    public void setExpiringSoonProducts(List<String> expiringSoonProducts) { this.expiringSoonProducts = expiringSoonProducts; }

    public List<String> getLowStockProducts() { return lowStockProducts; }
    public void setLowStockProducts(List<String> lowStockProducts) { this.lowStockProducts = lowStockProducts; }
}