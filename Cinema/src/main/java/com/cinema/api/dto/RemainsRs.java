package com.cinema.api.dto;

import java.time.LocalDateTime;

public class RemainsRs {
    private Long productId;
    private String productName;
    private Integer bar;
    private Integer warehouse;
    private LocalDateTime lastModified;

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public Integer getBar() { return bar; }
    public void setBar(Integer bar) { this.bar = bar; }

    public Integer getWarehouse() { return warehouse; }
    public void setWarehouse(Integer warehouse) { this.warehouse = warehouse; }

    public LocalDateTime getLastModified() { return lastModified; }
    public void setLastModified(LocalDateTime lastModified) { this.lastModified = lastModified; }
}