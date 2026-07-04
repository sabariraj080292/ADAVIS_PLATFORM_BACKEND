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
@Document(collection = "mdm_user_auth_credentials")
public class Credential {

    @Id
    private String id;

    @Indexed(unique = true)
    private String userId;

    @Indexed
    private String email;

    private String passwordHash;

    private Boolean mustChangePassword;

    private Instant passwordUpdatedAt;

    private Instant createdAt;
    private Instant updatedAt;
}
