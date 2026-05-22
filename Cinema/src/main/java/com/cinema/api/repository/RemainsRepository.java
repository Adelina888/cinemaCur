package com.cinema.api.repository;

import com.cinema.api.entity.Product;
import com.cinema.api.entity.Remains;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RemainsRepository extends JpaRepository<Remains, Long> {
    Optional<Remains> findByProduct(Product product);
    Optional<Remains> findByProductId(Long productId);
}