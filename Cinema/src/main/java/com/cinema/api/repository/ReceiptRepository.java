package com.cinema.api.repository;

import com.cinema.api.entity.Receipt;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface ReceiptRepository extends JpaRepository<Receipt, Long> {

    Page<Receipt> findAll(Pageable pageable);

    @Query("SELECT r FROM Receipt r WHERE r.date BETWEEN :start AND :end")
    Page<Receipt> findByDateRange(@Param("start") LocalDateTime start,
                                  @Param("end") LocalDateTime end,
                                  Pageable pageable);

    @Query("SELECT r FROM Receipt r WHERE r.date BETWEEN :start AND :end")
    List<Receipt> findByDateRange(@Param("start") LocalDateTime start,
                                  @Param("end") LocalDateTime end);

    List<Receipt> findByAdministratorId(Long administratorId);

    List<Receipt> findByTypeOfOperation(String typeOfOperation);

    boolean existsByOriginalReceiptId(Long originalReceiptId);
}