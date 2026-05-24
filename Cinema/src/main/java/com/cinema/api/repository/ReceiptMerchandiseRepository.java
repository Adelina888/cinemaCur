package com.cinema.api.repository;

import com.cinema.api.entity.ReceiptMerchandise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ReceiptMerchandiseRepository extends JpaRepository<ReceiptMerchandise, Long> {
    List<ReceiptMerchandise> findByReceiptId(Long receiptId);
    void deleteByReceiptId(Long receiptId);
    boolean existsByMerchandiseId(Long merchandiseId);

    @Query("SELECT SUM(rm.quantity) FROM ReceiptMerchandise rm WHERE rm.merchandise.id = :merchandiseId")
    Integer sumQuantityByMerchandiseId(@Param("merchandiseId") Long merchandiseId);

    @Query("SELECT SUM(rm.subtotal) FROM ReceiptMerchandise rm WHERE rm.merchandise.id = :merchandiseId")
    Double sumRevenueByMerchandiseId(@Param("merchandiseId") Long merchandiseId);

    @Query("SELECT rm.merchandise.id as id, rm.merchandise.name as name, SUM(rm.quantity) as totalQuantity, SUM(rm.subtotal) as totalRevenue " +
            "FROM ReceiptMerchandise rm GROUP BY rm.merchandise.id, rm.merchandise.name ORDER BY totalQuantity DESC")
    List<Object[]> getMerchandiseSalesStats();
}