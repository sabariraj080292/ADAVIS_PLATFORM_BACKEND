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
@Document(collection = "mdm_user_assignments_to_user_groups")
@CompoundIndex(name = "unique_user_group", def = "{'userId': 1, 'groupId': 1}", unique = true)
public class UserGroupAssignment {

    @Id
    private String id;

    private String userId;
    private String groupId;
    private Boolean isActive;

    private Instant assignedAt;
    private String assignedBy;
}