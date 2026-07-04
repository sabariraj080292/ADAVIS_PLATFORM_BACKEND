package com.adavis.license.model.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "mdm_licenses")
public class License {

    @Id
    private String id;

    @Indexed(name = "tenantId_1", unique = true)
    private String tenantId;

    private String licenseKey;

    private Plan plan;

    @Indexed
    private List<String> modules;

    private Integer maxUsers;
    private Integer currentUsers;

    @Indexed
    private String status; // ACTIVE, EXPIRED, SUSPENDED, INACTIVE, UPGRADED

    private Instant startDate;
    private Instant expiryDate;

    private Map<String, Object> metadata;

    private Integer upgradeCount;

    private Instant createdAt;
    private Instant updatedAt;
    private String createdBy;
    private String updatedBy;

    @Builder.Default
    private Boolean isDeleted = false;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Plan {
        private String planId;
        private String planName;
        private String planType; // PAID, TRIAL, FREE
        private Map<String, Object> features;
    }
}