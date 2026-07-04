package com.adavis.audit.util;

import com.adavis.audit.model.dto.AuditEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuditHelper {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    private final String auditTopic = "audit-events";

    public void sendAuditEvent(AuditEvent event) {
        try {
            event.setEventId(UUID.randomUUID().toString());
            event.setTimestamp(Instant.now());
            
            String message = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(auditTopic, event.getEntity(), message);
            log.debug("Audit event sent to Kafka: {}", event.getEventId());
        } catch (Exception e) {
            log.error("Failed to send audit event to Kafka: {}", e.getMessage(), e);
        }
    }

    public void logUserAction(String userId, String username, String action,
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
                .build();
        
        sendAuditEvent(event);
    }

    public void logFailure(String userId, String username, String action,
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
                .build();
        
        sendAuditEvent(event);
    }
}