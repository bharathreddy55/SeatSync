package com.seatsync.userservice.service;

import com.seatsync.userservice.dto.AuthResponse;
import com.seatsync.userservice.dto.LoginRequest;
import com.seatsync.userservice.dto.RegisterRequest;
import com.seatsync.userservice.model.Role;
import com.seatsync.userservice.model.User;
import com.seatsync.userservice.repository.UserRepository;
import com.seatsync.userservice.security.JwtTokenProvider;
import com.seatsync.userservice.security.TokenBlacklistService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Duration;
import java.util.HashMap;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

public class UserServiceTests {

    @Mock
    private UserRepository userRepository;

    @Mock
    private com.seatsync.userservice.repository.UserActivityRepository userActivityRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private TokenBlacklistService tokenBlacklistService;

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    @InjectMocks
    private UserService userService;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testRegister_Success() {
        RegisterRequest request = new RegisterRequest();
        request.setName("John Doe");
        request.setEmail("john@example.com");
        request.setPassword("password123");
        request.setRole("USER");

        User savedUser = User.builder()
                .id(1L)
                .email(request.getEmail())
                .name(request.getName())
                .role(Role.USER)
                .build();

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(request.getPassword())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(savedUser));

        Authentication auth = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(jwtTokenProvider.generateToken(eq(savedUser.getEmail()), anyMap())).thenReturn("accessToken");
        when(jwtTokenProvider.generateRefreshToken(savedUser.getEmail())).thenReturn("refreshToken");

        AuthResponse response = userService.register(request);

        assertNotNull(response);
        assertEquals("accessToken", response.getAccessToken());
        assertEquals("refreshToken", response.getRefreshToken());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    public void testRegister_DuplicateEmail_ThrowsException() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("john@example.com");

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> {
            userService.register(request);
        });
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    public void testLogin_Success() {
        LoginRequest request = new LoginRequest();
        request.setEmail("john@example.com");
        request.setPassword("password123");

        User user = User.builder()
                .id(1L)
                .email("john@example.com")
                .role(Role.USER)
                .build();

        Authentication auth = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));
        when(jwtTokenProvider.generateToken(eq(user.getEmail()), anyMap())).thenReturn("accessToken");
        when(jwtTokenProvider.generateRefreshToken(user.getEmail())).thenReturn("refreshToken");

        AuthResponse response = userService.login(request);

        assertNotNull(response);
        assertEquals("accessToken", response.getAccessToken());
        assertEquals("refreshToken", response.getRefreshToken());
    }

    @Test
    public void testInitiatePasswordReset_Success() {
        String email = "john@example.com";
        User user = User.builder()
                .email(email)
                .name("John Doe")
                .build();

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);

        userService.initiatePasswordReset(email);

        verify(valueOperations, times(1)).set(anyString(), eq(email), any(Duration.class));
        verify(kafkaTemplate, times(1)).send(eq("password-resets"), any());
    }

    @Test
    public void testCompletePasswordReset_Success() {
        String token = "reset-token-uuid";
        String email = "john@example.com";
        String newPassword = "newPassword123";
        User user = User.builder()
                .email(email)
                .name("John Doe")
                .build();

        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("password:reset:" + token)).thenReturn(email);
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));
        when(passwordEncoder.encode(newPassword)).thenReturn("encodedNewPassword");

        userService.completePasswordReset(token, newPassword);

        assertEquals("encodedNewPassword", user.getPassword());
        verify(userRepository, times(1)).save(user);
        verify(redisTemplate, times(1)).delete("password:reset:" + token);
    }
}
