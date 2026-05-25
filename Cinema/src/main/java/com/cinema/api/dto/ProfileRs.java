package com.cinema.api.dto;

public class ProfileRs {
    private Long id;
    private String fullName;
    private String login;
    private String role;

    public ProfileRs() {}

    public ProfileRs(Long id, String fullName, String login, String role) {
        this.id = id;
        this.fullName = fullName;
        this.login = login;
        this.role = role;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getLogin() { return login; }
    public void setLogin(String login) { this.login = login; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}