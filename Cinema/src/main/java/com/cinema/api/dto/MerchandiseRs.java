package com.cinema.api.dto;

import com.cinema.api.enums.MerchandiseType;

public class MerchandiseRs {
    private Long id;
    private String name;
    private Double price;
    private String imageUrl;
    private Integer size;
    private String material;
    private MerchandiseType type;
    private Integer count;
    private Integer status;

    public MerchandiseRs() {
    }

    public MerchandiseRs(Long id, String name, Double price, String imageUrl,
                         Integer size, String material, MerchandiseType type,
                         Integer count, Integer status) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.imageUrl = imageUrl;
        this.size = size;
        this.material = material;
        this.type = type;
        this.count = count;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Integer getSize() {
        return size;
    }

    public void setSize(Integer size) {
        this.size = size;
    }

    public String getMaterial() {
        return material;
    }

    public void setMaterial(String material) {
        this.material = material;
    }

    public MerchandiseType getType() {
        return type;
    }

    public void setType(MerchandiseType type) {
        this.type = type;
    }

    public Integer getCount() {
        return count;
    }

    public void setCount(Integer count) {
        this.count = count;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }
}