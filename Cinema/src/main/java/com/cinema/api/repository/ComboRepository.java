package com.cinema.api.repository;

import com.cinema.api.entity.Combo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ComboRepository extends JpaRepository<Combo, Long> {
    boolean existsByName(String name);
    List<Combo> findByNameContainingIgnoreCase(String name);
    List<Combo> findByIsActive(Boolean isActive);
    List<Combo> findByNameContainingIgnoreCaseAndIsActive(String name, Boolean isActive);
}