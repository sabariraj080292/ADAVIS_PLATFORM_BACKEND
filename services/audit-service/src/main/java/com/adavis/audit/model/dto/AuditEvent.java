package com.adavis.audit.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditEvent {

    private String eventId;
    private String userId;
    private String username;
    private String action;
    private String entity;
    private String entityId;
    private Map<String, Object> before;
    private Map<String, Object> after;
    private Map<String, Object> metadata;
    private String ipAddress;
    private String sessionId;
    private String userAgent;
    private String tenantId;
    private String status;
    private String failureReason;
    private Instant timestamp;
}