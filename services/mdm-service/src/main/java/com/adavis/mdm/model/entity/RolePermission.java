package com.adavis.mdm.model.entity;

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
@Document(collection = "mdm_role_permissions")
public class RolePermission {

    @Id
    private String id;

    private String roleId;
    private String moduleId;
    private Integer version;
    private Boolean isActive;

    private Instant effectiveFrom;
    private Instant effectiveTo;

    private List<ScreenPermission> screenPermissions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScreenPermission {
        private String screenId;
        private List<String> actions;
        private List<FeaturePermission> featurePermissions;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FeaturePermission {
        private String featureId;
        private List<String> actions;
    }
}