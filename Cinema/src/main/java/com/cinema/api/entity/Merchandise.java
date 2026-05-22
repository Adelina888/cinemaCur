package com.cinema.api.entity;

import com.cinema.api.enums.MerchandiseType;
import jakarta.persistence.*;

@Entity
@Table(name = "merchandise")
public class Merchandise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private Double price;

    private String imageUrl;

    private Integer size;

    private String material;

    @Enumerated(EnumType.STRING)
    private MerchandiseType type;

    private Integer count;

    private Integer status;

    public Merchandise() {
        this.status = 1;
        this.count = 0;
    }

    // геттеры и сеттеры
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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