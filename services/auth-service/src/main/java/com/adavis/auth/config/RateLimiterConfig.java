package com.adavis.auth.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;

import java.util.Collections;
import java.util.concurrent.TimeUnit;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class RateLimiterConfig {

    private final RedisTemplate<String, String> redisTemplate;

    @Bean
    public DefaultRedisScript<Long> rateLimitScript() {
        String script = """
            local key = KEYS[1]
            local limit = tonumber(ARGV[1])
            local window = tonumber(ARGV[2])
            local current = redis.call('INCR', key)
            if current == 1 then
                redis.call('EXPIRE', key, window)
            end
            if current > limit then
                return 0
            end
            return 1
            """;
        return new DefaultRedisScript<>(script, Long.class);
    }

    public boolean isAllowed(String key, int limit, int windowSeconds) {
        try {
            // Construct redis key with prefix
            String redisKey = "rate_limit:" + key;
            
            Long result = redisTemplate.execute(
                rateLimitScript(),
                Collections.singletonList(redisKey),
                String.valueOf(limit),
                String.valueOf(windowSeconds)
            );
            
            if (result == null) {
                return true; // Fail open if no result
            }
            
            boolean allowed = result == 1L;
            
            if (!allowed) {
                // Get current count and TTL for logging
                String count = redisTemplate.opsForValue().get(redisKey);
                Long ttl = redisTemplate.getExpire(redisKey, TimeUnit.SECONDS);
                log.warn("Rate limit exceeded for key: {}, count: {}, limit: {}, TTL: {}s", 
                         key, count, limit, ttl);
            }
            
            return allowed;
            
        } catch (Exception e) {
            // Fail open if Redis is down - log error
            log.error("Redis rate limiter failed, allowing request. Error: {}", e.getMessage());
            return true;
        }
    }

    public void resetRateLimit(String key) {
        try {
            String redisKey = "rate_limit:" + key;
            redisTemplate.delete(redisKey);
            log.debug("Rate limit reset for key: {}", key);
        } catch (Exception e) {
            log.error("Failed to reset rate limit for key: {}", key, e);
        }
    }
}