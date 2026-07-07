package com.adavis.audit.service;

import com.adavis.audit.model.dto.AuditEvent;
import com.adavis.audit.model.entity.AuditLog;
import com.adavis.audit.repository.AuditLogRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditLogService {

    private static final Set<String> SESSION_METADATA_KEYS = Set.of(
        "tenantId", "ipAddress", "userAgent", "isActive", "deviceInfo"
    );

    private static final Set<String> SENSITIVE_KEY_HINTS = Set.of(
        "token", "password", "secret", "credential", "authorization"
    );

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public AuditLog logEvent(AuditEvent event) {
        log.info("Logging audit event: action={}, user={}, entity={}", 
                event.getAction(), event.getUserId(), event.getEntity());

        Map<String, Object> metadata = event.getMetadata() == null
            ? new LinkedHashMap<>()
            : new LinkedHashMap<>(event.getMetadata());

        String tenantId = firstNonBlank(event.getTenantId(), asString(metadata.remove("tenantId")));
        String ipAddress = firstNonBlank(event.getIpAddress(), asString(metadata.remove("ipAddress")));
        String sessionId = firstNonBlank(event.getSessionId(), asString(metadata.remove("sessionId")));
        String userAgent = firstNonBlank(event.getUserAgent(), asString(metadata.remove("userAgent")));

        metadata = sanitizeMetadata(event.getEntity(), metadata);

        AuditLog auditLog = AuditLog.builder()
                .id(UUID.randomUUID().toString())
                .userId(event.getUserId())
            .username(null)
                .action(event.getAction())
                .entity(event.getEntity())
                .entityId(event.getEntityId())
                .before(event.getBefore())
                .after(event.getAfter())
            .metadata(metadata.isEmpty() ? null : metadata)
            .ipAddress(ipAddress)
            .sessionId(sessionId)
            .userAgent(userAgent)
            .tenantId(tenantId)
                .status(event.getStatus() != null ? event.getStatus() : "SUCCESS")
                .failureReason(event.getFailureReason())
                .timestamp(event.getTimestamp() != null ? event.getTimestamp() : Instant.now())
                .version(1)
                .build();

        return auditLogRepository.save(auditLog);
    }

    public AuditLog getAuditLog(String id) {
        return auditLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Audit log not found: " + id));
    }

    public List<AuditLog> getAuditLogsByEntity(String entity, String entityId) {
        return auditLogRepository.findByEntityAndEntityIdOrderByTimestampDesc(entity, entityId);
    }

    public Page<AuditLog> getAuditLogsByUser(String userId, Pageable pageable) {
        return auditLogRepository.findByUserIdOrderByTimestampDesc(userId, pageable);
    }

    public Page<AuditLog> getAuditTrails(String userId, Pageable pageable) {
        if (userId != null && !userId.isBlank()) {
            return auditLogRepository.findByUserIdOrderByTimestampDesc(userId, pageable);
        }
        return auditLogRepository.findAll(pageable);
    }

    public Page<AuditLog> getAuditLogsByAction(String action, Instant from, Instant to, Pageable pageable) {
        return auditLogRepository.findByActionAndTimestampBetween(action, from, to, pageable);
    }

    public List<AuditLog> getAuditLogsByTenant(String tenantId, Instant from, Instant to) {
        return auditLogRepository.findByTenantIdAndTimestampBetween(tenantId, from, to);
    }

    public long countActionsByDateRange(String action, Instant from, Instant to) {
        return auditLogRepository.countByActionAndTimestampBetween(action, from, to);
    }

    @Transactional
    public AuditLog logUserAction(String userId, String username, String action, 
                                   String entity, String entityId, 
                                   Map<String, Object> before, Map<String, Object> after,
                                   String ipAddress, String sessionId) {
        AuditEvent event = AuditEvent.builder()
                .userId(userId)
                .username(username)
                .action(action)
                .entity(entity)
                .entityId(entityId)
                .before(before)
                .after(after)
                .ipAddress(ipAddress)
                .sessionId(sessionId)
                .status("SUCCESS")
                .timestamp(Instant.now())
                .build();

        return logEvent(event);
    }

    @Transactional
    public AuditLog logFailure(String userId, String username, String action, 
                                String entity, String entityId, 
                                String failureReason, String ipAddress, String sessionId) {
        AuditEvent event = AuditEvent.builder()
                .userId(userId)
                .username(username)
                .action(action)
                .entity(entity)
                .entityId(entityId)
                .ipAddress(ipAddress)
                .sessionId(sessionId)
                .status("FAILURE")
                .failureReason(failureReason)
                .timestamp(Instant.now())
                .build();

        return logEvent(event);
    }

    private String asString(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private String firstNonBlank(String primary, String fallback) {
        if (primary != null && !primary.isBlank()) {
            return primary;
        }
        if (fallback != null && !fallback.isBlank()) {
            return fallback;
        }
        return null;
    }

    private Map<String, Object> sanitizeMetadata(String entity, Map<String, Object> metadata) {
        if (metadata == null || metadata.isEmpty()) {
            return metadata;
        }

        Map<String, Object> sanitized = new LinkedHashMap<>();
        Set<String> allowList = "AUTH_SESSION".equalsIgnoreCase(entity)
                ? new HashSet<>(SESSION_METADATA_KEYS)
                : null;

        for (Map.Entry<String, Object> entry : metadata.entrySet()) {
            String key = entry.getKey();
            if (key == null) {
                continue;
            }

            String normalized = key.toLowerCase();
            boolean sensitive = SENSITIVE_KEY_HINTS.stream().anyMatch(normalized::contains);
            if (sensitive) {
                continue;
            }

            if (allowList != null && !allowList.contains(key)) {
                continue;
            }

            sanitized.put(key, entry.getValue());
        }

        return sanitized;
    }
}