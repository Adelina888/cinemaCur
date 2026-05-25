package com.cinema.api.service;

import com.cinema.api.aspect.LoggerAspect;
import com.cinema.api.dto.AuthRq;
import com.cinema.api.dto.AuthRs;
import com.cinema.api.dto.ProfileRs;
import com.cinema.api.entity.Administrator;
import com.cinema.api.exception.ValidationError;
import com.cinema.api.repository.AdministratorRepository;
import com.cinema.api.security.JwtTokenUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AdministratorRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenUtil jwtTokenUtil;
    private final AuthenticationManager authenticationManager;
    private final LoggerAspect logger;

    public AuthService(AdministratorRepository adminRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenUtil jwtTokenUtil,
                       AuthenticationManager authenticationManager,
                       LoggerAspect logger) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenUtil = jwtTokenUtil;
        this.authenticationManager = authenticationManager;
        this.logger = logger;
    }

    @Transactional
    public AuthRs authenticate(AuthRq authRq) {
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authRq.getLogin(), authRq.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(auth);
            Administrator admin = (Administrator) auth.getPrincipal();
            String token = jwtTokenUtil.generateToken(admin);
            logger.logAuthentication(authRq.getLogin(), true);
            return new AuthRs(token, admin.getId(), admin.getFullName(), admin.getLogin());
        } catch (Exception e) {
            logger.logAuthentication(authRq.getLogin(), false);
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public ProfileRs getProfile(Long adminId) {
        Administrator admin = adminRepository.findById(adminId)
                .orElseThrow(() -> new ValidationError("id", "Администратор не найден"));

        ProfileRs profile = new ProfileRs();
        profile.setId(admin.getId());
        profile.setFullName(admin.getFullName());
        profile.setLogin(admin.getLogin());
        profile.setRole(admin.getRole());
        return profile;
    }

    @Transactional
    public void changePassword(Long adminId, String oldPassword, String newPassword) {
        Administrator admin = adminRepository.findById(adminId)
                .orElseThrow(() -> new ValidationError("id", "Администратор не найден"));

        if (!passwordEncoder.matches(oldPassword, admin.getPassword())) {
            throw new ValidationError("oldPassword", "Текущий пароль неверен");
        }

        if (passwordEncoder.matches(newPassword, admin.getPassword())) {
            throw new ValidationError("newPassword", "Новый пароль должен отличаться от текущего");
        }

        admin.setPassword(passwordEncoder.encode(newPassword));
        adminRepository.save(admin);

        logger.logAuthentication(admin.getLogin(), true);
    }
}