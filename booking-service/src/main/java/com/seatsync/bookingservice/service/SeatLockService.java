package com.seatsync.bookingservice.service;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import java.time.Duration;

@Service
public class SeatLockService {

    private final StringRedisTemplate redisTemplate;

    public SeatLockService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public boolean acquireLock(Long seatId, Long userId) {
        String key = "seat:hold:" + seatId;
        String val = String.valueOf(userId);
        Boolean success = redisTemplate.opsForValue().setIfAbsent(key, val, Duration.ofMinutes(5));
        return success != null && success;
    }

    public void releaseLock(Long seatId, Long userId) {
        String key = "seat:hold:" + seatId;
        String val = redisTemplate.opsForValue().get(key);
        if (String.valueOf(userId).equals(val)) {
            redisTemplate.delete(key);
        }
    }
}
