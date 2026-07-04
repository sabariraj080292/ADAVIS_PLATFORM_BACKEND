package com.adavis.dto.auth.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionResponse {

    private String sessionId;
    private String userId;
    private String deviceInfo;
    private String ipAddress;
    private String userAgent;
    private Instant createdAt;
    private Instant expiresAt;
    private Instant lastActivity;
    private Boolean isActive;
}