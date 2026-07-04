package com.adavis.license.model.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "mdm_licence_history")
public class LicenseHistory {

    @Id
    private String id;

    private String tenantId;
    private String licenseId;
    private String action; // ACTIVATED, UPGRADED, RENEWED, SUSPENDED, EXPIRED, USER_COUNT_UPDATED, STATUS_CHANGED

    private String beforeStatus;
    private String afterStatus;

    private Integer beforeMaxUsers;
    private Integer afterMaxUsers;

    private List<String> beforeModules;
    private List<String> afterModules;

    private Instant beforeExpiry;
    private Instant afterExpiry;

    private String reason;
    private String performedBy;
    private Instant performedAt;
}