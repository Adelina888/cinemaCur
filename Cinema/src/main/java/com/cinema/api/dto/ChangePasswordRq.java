package com.cinema.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ChangePasswordRq {

    @NotBlank(message = "Текущий пароль обязателен")
    private String oldPassword;

    @NotBlank(message = "Новый пароль обязателен")
    @Size(min = 4, message = "Новый пароль должен содержать минимум 4 символа")
    private String newPassword;

    public String getOldPassword() { return oldPassword; }
    public void setOldPassword(String oldPassword) { this.oldPassword = oldPassword; }
    public String getNewPassword() { return newPassword; }
    public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
}