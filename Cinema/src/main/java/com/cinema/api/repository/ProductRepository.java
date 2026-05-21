package com.cinema.api.repository;

import com.cinema.api.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findByName(String name);
    boolean existsByName(String name);
    List<Product> findByNameContainingIgnoreCase(String name);
    List<Product> findByCategory(String category);
    List<Product> findByStatus(Integer status);
    @Query(value = "SELECT * FROM products WHERE expiration_days IS NOT NULL AND expiration_days > 0 AND (date_of_creation + (expiration_days * INTERVAL '1 day')) < CURRENT_DATE", nativeQuery = true)
    List<Product> findExpiredProducts();

    @Query(value = "SELECT * FROM products WHERE expiration_days IS NOT NULL AND expiration_days > 0 AND (date_of_creation + (expiration_days * INTERVAL '1 day')) < :date", nativeQuery = true)
    List<Product> findExpiredProductsBeforeDate(@Param("date") LocalDate date);
}