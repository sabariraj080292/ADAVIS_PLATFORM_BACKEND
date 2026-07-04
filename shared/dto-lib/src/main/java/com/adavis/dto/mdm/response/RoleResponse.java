package com.adavis.dto.mdm.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleResponse {

    private String roleId;
    private String name;
    private String description;
    private String parentRoleId;
    private String parentRoleName;
    private Integer level;
    private List<String> hierarchyPath;
    private Boolean isActive;
    private Integer assignedGroupCount;
    private Instant createdAt;
    private Instant updatedAt;
}