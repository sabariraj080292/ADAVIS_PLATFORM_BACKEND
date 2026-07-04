package com.adavis.auth.model.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "auth_users")
public class User {

    @Id
    private String id;

    @Indexed(unique = true)
    private String userId; // Business identifier (e.g., ADMIN-001)

    @Indexed(unique = true)
    private String username;

    @Indexed(unique = true)
    private String email;

    private String status;  // ACTIVE, BLOCKED, DEACTIVATED

    private Boolean isLocked;
    private Integer failedAttempts;
    private Instant lastLoginAt;

    private Boolean isDeleted;

    private Instant createdAt;
    private Instant updatedAt;
}