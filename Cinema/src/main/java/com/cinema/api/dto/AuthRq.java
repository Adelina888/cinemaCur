package com.cinema.api.dto;

import jakarta.validation.constraints.NotBlank;

public class AuthRq {
    @NotBlank
    private String login;
    @NotBlank
    private String password;

    // геттеры и сеттеры
    public String getLogin() { return login; }
    public void setLogin(String login) { this.login = login; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}