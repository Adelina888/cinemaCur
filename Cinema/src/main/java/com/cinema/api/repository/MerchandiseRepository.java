package com.cinema.api.repository;

import com.cinema.api.entity.Merchandise;
import com.cinema.api.enums.MerchandiseType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MerchandiseRepository extends JpaRepository<Merchandise, Long> {
    boolean existsByName(String name);
    List<Merchandise> findByNameContainingIgnoreCase(String name);
    List<Merchandise> findByType(MerchandiseType type);
    List<Merchandise> findBySize(Integer size);
    List<Merchandise> findByStatus(Integer status);
}