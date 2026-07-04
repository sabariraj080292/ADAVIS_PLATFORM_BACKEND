package com.adavis.auth.model.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "mdm_user_sessions")
public class Session {

    @Id
    private String id;

    @Indexed(unique = true)
    private String sessionId;

    @Indexed
    private String tenantId;

    private String userId;
    private String refreshToken;

    private String deviceInfo;
    private String ipAddress;

    private Instant createdAt;
    @Indexed(expireAfterSeconds = 0)
    private Instant expiresAt;
    @Field("lastActivityAt")
    private Instant lastActivity;

    private Boolean isActive;
}