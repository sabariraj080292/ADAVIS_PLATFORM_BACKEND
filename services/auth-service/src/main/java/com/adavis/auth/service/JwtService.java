package com.adavis.auth.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class JwtService {

    private final SecretKey key;
    private final long expirationMs;
    private final long refreshExpirationMs;

    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration:3600000}") long expirationMs,
            @Value("${jwt.refresh-expiration:86400000}") long refreshExpirationMs) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
        this.refreshExpirationMs = refreshExpirationMs;
    }

    public String generateAccessToken(String userId, String username, List<String> roles) {
        return generateAccessToken(userId, username, roles, null);
    }

    public String generateAccessToken(String userId, String username, List<String> roles, String sessionId) {
        return generateToken(userId, username, roles, sessionId, expirationMs);
    }

    public String generateRefreshToken(String userId, String username) {
        return generateToken(userId, username, null, null, refreshExpirationMs);
    }

    private String generateToken(String userId, String username, List<String> roles, String sessionId, long expirationMs) {
        Instant now = Instant.now();
        var builder = Jwts.builder()
                .id(UUID.randomUUID().toString())
                .subject(userId)
                .claim("username", username)
                .claim("roles", roles != null ? roles : List.of())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(expirationMs)))
                .signWith(key);

        if (sessionId != null && !sessionId.isBlank()) {
            builder.claim("sessionId", sessionId);
        }

        return builder.compact();
    }

    public String extractUserId(String token) {
        try {
            return parseToken(token).getSubject();
        } catch (Exception e) {
            return null;
        }
    }

    public String extractUsername(String token) {
        try {
            return parseToken(token).get("username", String.class);
        } catch (Exception e) {
            return null;
        }
    }

    @SuppressWarnings("unchecked")
    public List<String> extractRoles(String token) {
        try {
            return parseToken(token).get("roles", List.class);
        } catch (Exception e) {
            return List.of();
        }
    }

    public String extractSessionId(String token) {
        try {
            return parseToken(token).get("sessionId", String.class);
        } catch (Exception e) {
            return null;
        }
    }

    public boolean validateToken(String token) {
        try {
            parseToken(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public Date getExpirationDate(String token) {
        try {
            return parseToken(token).getExpiration();
        } catch (Exception e) {
            return null;
        }
    }

    private Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}