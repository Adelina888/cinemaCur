package com.cinema.api.dto;

public class AuthRs {
    private String token;
    private Long adminId;
    private String fullName;
    private String login;

    public AuthRs() {
    }

    public AuthRs(String token, Long adminId, String fullName, String login) {
        this.token = token;
        this.adminId = adminId;
        this.fullName = fullName;
        this.login = login;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public Long getAdminId() {
        return adminId;
    }

    public void setAdminId(Long adminId) {
        this.adminId = adminId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getLogin() {
        return login;
    }

    public void setLogin(String login) {
        this.login = login;
    }
}