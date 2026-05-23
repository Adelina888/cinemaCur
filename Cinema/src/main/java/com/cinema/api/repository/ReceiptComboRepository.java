package com.cinema.api.repository;

import com.cinema.api.entity.ReceiptCombo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ReceiptComboRepository extends JpaRepository<ReceiptCombo, Long> {
    List<ReceiptCombo> findByReceiptId(Long receiptId);
    void deleteByReceiptId(Long receiptId);

    @Query("SELECT SUM(rc.quantity) FROM ReceiptCombo rc WHERE rc.combo.id = :comboId")
    Integer sumQuantityByComboId(@Param("comboId") Long comboId);

    @Query("SELECT SUM(rc.subtotal) FROM ReceiptCombo rc WHERE rc.combo.id = :comboId")
    Double sumRevenueByComboId(@Param("comboId") Long comboId);

    @Query("SELECT rc.combo.id as id, rc.combo.name as name, SUM(rc.quantity) as totalQuantity, SUM(rc.subtotal) as totalRevenue " +
            "FROM ReceiptCombo rc GROUP BY rc.combo.id, rc.combo.name ORDER BY totalQuantity DESC")
    List<Object[]> getComboSalesStats();
}