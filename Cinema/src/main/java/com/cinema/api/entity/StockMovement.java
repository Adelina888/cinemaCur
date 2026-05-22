package com.cinema.api.entity;

import com.cinema.api.enums.MovementType;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_movement")
public class StockMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Enumerated(EnumType.STRING)
    private MovementType type;

    private Integer quantity;        // количество (положительное)
    private String source;           // "WAREHOUSE", "BAR" (откуда)
    private String target;           // "WAREHOUSE", "BAR" (куда)
    private Long adminId;            // кто выполнил операцию
    private LocalDateTime createdAt;
    private String note;             // примечание (например, "инвентаризация")

    public StockMovement() {
        this.createdAt = LocalDateTime.now();
    }

    public StockMovement(Product product, MovementType type, Integer quantity, Long adminId) {
        this();
        this.product = product;
        this.type = type;
        this.quantity = quantity;
        this.adminId = adminId;
    }

    // геттеры и сеттеры
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

    public MovementType getType() { return type; }
    public void setType(MovementType type) { this.type = type; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getTarget() { return target; }
    public void setTarget(String target) { this.target = target; }

    public Long getAdminId() { return adminId; }
    public void setAdminId(Long adminId) { this.adminId = adminId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}