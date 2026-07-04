package com.adavis.mdm.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
@Document(collection = "mdm_user_groups")
public class Group {

    @JsonIgnore
    @Id
    private String id;

    @Indexed(unique = true)
    private String groupId;

    private String tenantId;

    private String groupCode;

    private String groupName;

    private String name;
    private String description;
    private Boolean isActive;

    private Instant createdAt;
    private Instant updatedAt;
}