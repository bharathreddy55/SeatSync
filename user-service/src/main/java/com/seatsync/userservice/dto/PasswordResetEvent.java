package com.seatsync.userservice.dto;

public class PasswordResetEvent {
    private String email;
    private String userName;
    private String token;

    public PasswordResetEvent() {}

    public PasswordResetEvent(String email, String userName, String token) {
        this.email = email;
        this.userName = userName;
        this.token = token;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
}
