package com.adavis.audit.consumer;

import com.adavis.audit.model.dto.AuditEvent;
import com.adavis.audit.service.AuditLogService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuditEventConsumer {

    private final AuditLogService auditLogService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "${kafka.topic.audit}", groupId = "${kafka.consumer.group-id}")
    public void consumeAuditEvent(String message) {
        try {
            log.debug("Received audit event: {}", message);
            AuditEvent event = objectMapper.readValue(message, AuditEvent.class);
            auditLogService.logEvent(event);
            log.info("Audit event logged successfully: {}", event.getEventId());
        } catch (Exception e) {
            log.error("Failed to process audit event: {}", e.getMessage(), e);
        }
    }
}