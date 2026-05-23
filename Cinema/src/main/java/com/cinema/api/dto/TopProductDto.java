package com.cinema.api.dto;

public class TopProductDto {
    private Long productId;
    private String productName;
    private Integer totalQuantity;
    private Double totalRevenue;

    public TopProductDto() {}

    public TopProductDto(Long productId, String productName, Integer totalQuantity, Double totalRevenue) {
        this.productId = productId;
        this.productName = productName;
        this.totalQuantity = totalQuantity;
        this.totalRevenue = totalRevenue;
    }

    // Геттеры и сеттеры
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public Integer getTotalQuantity() { return totalQuantity; }
    public void setTotalQuantity(Integer totalQuantity) { this.totalQuantity = totalQuantity; }

    public Double getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(Double totalRevenue) { this.totalRevenue = totalRevenue; }
}