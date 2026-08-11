package com.seatsync.userservice.security;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import java.time.Duration;

@Service
public class TokenBlacklistService {

    private final StringRedisTemplate redisTemplate;

    public TokenBlacklistService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void blacklistToken(String token, long remainingLifespanMs) {
        if (remainingLifespanMs > 0) {
            String key = "token:blacklist:" + token;
            redisTemplate.opsForValue().set(key, "revoked", Duration.ofMillis(remainingLifespanMs));
        }
    }

    public boolean isBlacklisted(String token) {
        String key = "token:blacklist:" + token;
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }
}
