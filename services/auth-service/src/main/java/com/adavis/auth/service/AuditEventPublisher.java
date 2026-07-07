package com.adavis.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class AuditEventPublisher {

    @Value("${services.audit.base-url:http://audit-service:8084}")
    private String auditBaseUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public void publish(String userId,
                        String username,
                        String action,
                        String entity,
                        String entityId,
                        String status,
                        String failureReason,
                        Map<String, Object> metadata) {
        publish(userId, username, action, entity, entityId, status, null, null, failureReason, metadata);
        }

        public void publish(String userId,
                String username,
                String action,
                String entity,
                String entityId,
                String status,
                Map<String, Object> before,
                Map<String, Object> after,
                String failureReason,
                Map<String, Object> metadata) {
        try {
            String url = auditBaseUrl + "/internal/v1/audit/logs";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> payload = new HashMap<>();
            payload.put("userId", userId);
            payload.put("username", username);
            payload.put("action", action);
            payload.put("entity", entity);
            payload.put("entityId", entityId);
            payload.put("status", status);
            payload.put("before", before);
            payload.put("after", after);
            payload.put("failureReason", failureReason);
            Map<String, Object> metadataPayload = metadata == null
                    ? new LinkedHashMap<>()
                    : new LinkedHashMap<>(metadata);

            Object tenantId = metadataPayload.remove("tenantId");
            if (tenantId != null) {
                payload.put("tenantId", String.valueOf(tenantId));
            }

            Object ipAddress = metadataPayload.remove("ipAddress");
            if (ipAddress != null) {
                payload.put("ipAddress", String.valueOf(ipAddress));
            }

            Object sessionId = metadataPayload.remove("sessionId");
            if (sessionId != null) {
                payload.put("sessionId", String.valueOf(sessionId));
            }

            Object userAgent = metadataPayload.remove("userAgent");
            if (userAgent != null) {
                payload.put("userAgent", String.valueOf(userAgent));
            }

            if (!metadataPayload.isEmpty()) {
                payload.put("metadata", metadataPayload);
            }
            payload.put("timestamp", Instant.now().toString());

            restTemplate.postForEntity(url, new HttpEntity<>(payload, headers), String.class);
        } catch (Exception ex) {
            log.warn("Failed to publish audit event action={} entity={} entityId={} reason={}",
                    action, entity, entityId, ex.getMessage());
        }
    }
}
