package com.adavis.auth.service;

import com.adavis.auth.model.entity.Session;
import com.adavis.auth.repository.SessionRepository;
import com.adavis.dto.auth.response.SessionResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class SessionService {

    private final SessionRepository sessionRepository;
    private final AuditEventPublisher auditEventPublisher;

    @Value("${session.timeout-minutes:30}")
    private int sessionTimeoutMinutes;

    // ✅ This method exists and is used by AuthService
    public Session createSession(String userId, String tenantId, String refreshToken, String deviceInfo, String ipAddress) {
        String sessionId = UUID.randomUUID().toString();
        Session session = Session.builder()
            .id(sessionId)
            .sessionId(sessionId)
                .tenantId(tenantId)
                .userId(userId)
                .refreshToken(refreshToken)
                .deviceInfo(deviceInfo != null ? deviceInfo : "Unknown")
                .ipAddress(ipAddress != null ? ipAddress : "Unknown")
                .createdAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(sessionTimeoutMinutes * 60L))
                .lastActivity(Instant.now())
                .isActive(true)
                .build();

        Session saved = sessionRepository.save(session);
        publishSessionAudit("SESSION_CREATED", saved);
        log.info("Created session for user: {}", userId);
        return saved;
    }

    public List<SessionResponse> getActiveSessions(String userId) {
        expireSessions();
        List<Session> sessions = sessionRepository.findByUserIdAndIsActiveTrue(userId);
        return sessions.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public void terminateSession(String sessionId) {
        sessionRepository.findById(sessionId).ifPresent(session -> {
            session.setIsActive(false);
            Session saved = sessionRepository.save(session);
            publishSessionAudit("SESSION_TERMINATED", saved);
            log.info("Terminated session: {}", sessionId);
        });
    }

    public void terminateAllSessions(String userId) {
        List<Session> sessions = sessionRepository.findByUserIdAndIsActiveTrue(userId);
        sessions.forEach(session -> {
            session.setIsActive(false);
            Session saved = sessionRepository.save(session);
            publishSessionAudit("SESSION_TERMINATED", saved);
        });
        log.info("Terminated all sessions for user: {}", userId);
    }

    public void terminateSessionByRefreshToken(String refreshToken) {
        sessionRepository.findByRefreshToken(refreshToken).ifPresent(session -> {
            session.setIsActive(false);
            Session saved = sessionRepository.save(session);
            publishSessionAudit("SESSION_TERMINATED", saved);
            log.info("Terminated session by refresh token for user: {}", session.getUserId());
        });
    }

    @Scheduled(fixedDelayString = "${session.expiry-scan-interval-ms:60000}")
    public void expireSessions() {
        Instant now = Instant.now();
        List<Session> expiredSessions = sessionRepository.findByIsActiveTrueAndExpiresAtBefore(now);
        if (expiredSessions.isEmpty()) {
            return;
        }

        expiredSessions.forEach(session -> session.setIsActive(false));
        List<Session> savedSessions = sessionRepository.saveAll(expiredSessions);
        savedSessions.forEach(session -> publishSessionAudit("SESSION_EXPIRED", session));
        log.info("Marked {} expired sessions inactive", expiredSessions.size());
    }

    private void publishSessionAudit(String action, Session session) {
        auditEventPublisher.publish(
                session.getUserId(),
                session.getUserId(),
                action,
                "AUTH_SESSION",
                session.getSessionId(),
                "SUCCESS",
                null,
                java.util.Map.of(
                        "tenantId", session.getTenantId() == null ? "" : session.getTenantId(),
                        "ipAddress", session.getIpAddress() == null ? "" : session.getIpAddress(),
                        "isActive", Boolean.TRUE.equals(session.getIsActive())
                )
        );
    }

    private SessionResponse toResponse(Session session) {
        return SessionResponse.builder()
                .sessionId(session.getSessionId())
                .userId(session.getUserId())
                .deviceInfo(session.getDeviceInfo())
                .ipAddress(session.getIpAddress())
                .createdAt(session.getCreatedAt())
                .expiresAt(session.getExpiresAt())
                .lastActivity(session.getLastActivity())
                .isActive(session.getIsActive())
                .build();
    }
}