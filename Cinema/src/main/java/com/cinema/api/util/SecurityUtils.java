package com.cinema.api.util;

import com.cinema.api.entity.Administrator;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtils {

    public static Long getCurrentAdminId() {
        try {
            Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            if (principal instanceof Administrator) {
                return ((Administrator) principal).getId();
            }
        } catch (Exception e) {
            throw new RuntimeException("Пользователь не аутентифицирован");
        }
        throw new RuntimeException("Пользователь не аутентифицирован");
    }
}