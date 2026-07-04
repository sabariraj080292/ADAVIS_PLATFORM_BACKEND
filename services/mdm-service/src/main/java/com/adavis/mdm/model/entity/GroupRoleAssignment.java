package com.adavis.mdm.model.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "mdm_role_assignments_to_user_groups")
@CompoundIndex(name = "unique_group_role", def = "{'groupId': 1, 'roleId': 1}", unique = true)
public class GroupRoleAssignment {

    @Id
    private String id;

    private String groupId;
    private String roleId;
    private Boolean isActive;

    private Instant assignedAt;
    private String assignedBy;
}