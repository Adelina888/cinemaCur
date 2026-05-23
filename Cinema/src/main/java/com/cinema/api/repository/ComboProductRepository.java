package com.cinema.api.repository;

import com.cinema.api.entity.ComboProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ComboProductRepository extends JpaRepository<ComboProduct, Long> {
    List<ComboProduct> findByComboId(Long comboId);
    void deleteByComboId(Long comboId);

    @Query("SELECT SUM(cp.quantity) FROM ComboProduct cp WHERE cp.product.id = :productId")
    Integer sumQuantityByProductId(@Param("productId") Long productId);
}