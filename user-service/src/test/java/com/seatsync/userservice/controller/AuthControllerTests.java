package com.seatsync.userservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.seatsync.userservice.dto.LoginRequest;
import com.seatsync.userservice.dto.RegisterRequest;
import com.seatsync.userservice.security.JwtTokenProvider;
import com.seatsync.userservice.security.TokenBlacklistService;
import com.seatsync.userservice.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
public class AuthControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserService userService;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private TokenBlacklistService tokenBlacklistService;

    @MockBean
    private UserDetailsService userDetailsService;

    @Test
    public void testRegister_InvalidPayload_ReturnsBadRequest() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setName(""); // invalid: blank
        request.setEmail("invalid-email-format"); // invalid email
        request.setPassword("123"); // invalid: < 6 chars

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.name").value("Name is required"))
                .andExpect(jsonPath("$.email").value("Email must be valid"))
                .andExpect(jsonPath("$.password").value("Password must be at least 6 characters"));
    }

    @Test
    public void testLogin_InvalidPayload_ReturnsBadRequest() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail(""); // invalid
        request.setPassword(""); // invalid

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.email").value("Email is required"))
                .andExpect(jsonPath("$.password").value("Password is required"));
    }
}
