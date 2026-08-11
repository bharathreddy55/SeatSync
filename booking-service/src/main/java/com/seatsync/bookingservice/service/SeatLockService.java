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
        String val = String.valueOf(userId);
        String script = "if redis.call('get', KEYS[1]) == ARGV[1] then " +
                        "return redis.call('del', KEYS[1]) " +
                        "else " +
                        "return 0 " +
                        "end";
        redisTemplate.execute(
            new org.springframework.data.redis.core.script.DefaultRedisScript<>(script, Long.class),
            java.util.Collections.singletonList(key),
            val
        );
    }
}
