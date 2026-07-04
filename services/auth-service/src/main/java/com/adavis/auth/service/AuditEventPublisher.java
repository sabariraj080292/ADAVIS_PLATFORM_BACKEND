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
            payload.put("failureReason", failureReason);
            payload.put("metadata", metadata == null ? Map.of() : metadata);
            Object tenantId = metadata == null ? null : metadata.get("tenantId");
            if (tenantId != null) {
                payload.put("tenantId", String.valueOf(tenantId));
            }
            payload.put("timestamp", Instant.now().toString());

            restTemplate.postForEntity(url, new HttpEntity<>(payload, headers), String.class);
        } catch (Exception ex) {
            log.warn("Failed to publish audit event action={} entity={} entityId={} reason={}",
                    action, entity, entityId, ex.getMessage());
        }
    }
}
