package com.cinema.api.controller;

import com.cinema.api.dto.AuthRq;
import com.cinema.api.dto.AuthRs;
import com.cinema.api.service.AuthService;
import com.cinema.api.util.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthRs> login(@Valid @RequestBody AuthRq authRq) {
        return ResponseEntity.ok(authService.authenticate(authRq));
    }
    @GetMapping("/me")
    public ResponseEntity<Long> getCurrentAdminId() {
        return ResponseEntity.ok(SecurityUtils.getCurrentAdminId());
    }
}