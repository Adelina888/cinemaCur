package com.cinema.api.dto;

public class TopMerchandiseDto {
    private Long merchandiseId;
    private String merchandiseName;
    private Integer totalQuantity;
    private Double totalRevenue;

    public TopMerchandiseDto() {}

    public TopMerchandiseDto(Long merchandiseId, String merchandiseName, Integer totalQuantity, Double totalRevenue) {
        this.merchandiseId = merchandiseId;
        this.merchandiseName = merchandiseName;
        this.totalQuantity = totalQuantity;
        this.totalRevenue = totalRevenue;
    }

    public Long getMerchandiseId() { return merchandiseId; }
    public void setMerchandiseId(Long merchandiseId) { this.merchandiseId = merchandiseId; }

    public String getMerchandiseName() { return merchandiseName; }
    public void setMerchandiseName(String merchandiseName) { this.merchandiseName = merchandiseName; }

    public Integer getTotalQuantity() { return totalQuantity; }
    public void setTotalQuantity(Integer totalQuantity) { this.totalQuantity = totalQuantity; }

    public Double getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(Double totalRevenue) { this.totalRevenue = totalRevenue; }
}