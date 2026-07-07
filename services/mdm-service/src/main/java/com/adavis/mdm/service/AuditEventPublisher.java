package com.adavis.mdm.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
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
                        String action,
                        String entity,
                        String entityId,
                        String status,
                        Map<String, Object> metadata) {
        publish(userId, action, entity, entityId, status, null, null, metadata);
    }

    public void publish(String userId,
                        String action,
                        String entity,
                        String entityId,
                        String status,
                        Map<String, Object> before,
                        Map<String, Object> after,
                        Map<String, Object> metadata) {
        try {
            String url = auditBaseUrl + "/internal/v1/audit/logs";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> payload = new HashMap<>();
            payload.put("userId", userId);
            payload.put("username", userId);
            payload.put("action", action);
            payload.put("entity", entity);
            payload.put("entityId", entityId);
            payload.put("status", status);
            payload.put("before", before);
            payload.put("after", after);
            Map<String, Object> metadataPayload = metadata == null
                    ? new LinkedHashMap<>()
                    : new LinkedHashMap<>(metadata);

            enrichRequestMetadata(metadataPayload);

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

    private void enrichRequestMetadata(Map<String, Object> metadataPayload) {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null) {
            return;
        }

        HttpServletRequest request = attributes.getRequest();
        putIfAbsent(metadataPayload, "tenantId", request.getHeader("X-Tenant-Id"));
        putIfAbsent(metadataPayload, "ipAddress", resolveClientIp(request));
        putIfAbsent(metadataPayload, "sessionId", firstNonBlank(
                request.getHeader("X-Session-Id"),
                request.getRequestedSessionId()));
        putIfAbsent(metadataPayload, "userAgent", request.getHeader("User-Agent"));
    }

    private void putIfAbsent(Map<String, Object> metadataPayload, String key, String value) {
        if (!metadataPayload.containsKey(key) && StringUtils.hasText(value)) {
            metadataPayload.put(key, value.trim());
        }
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(forwardedFor)) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private String firstNonBlank(String... values) {
        if (values == null) {
            return null;
        }
        for (String value : values) {
            if (StringUtils.hasText(value)) {
                return value;
            }
        }
        return null;
    }
}
