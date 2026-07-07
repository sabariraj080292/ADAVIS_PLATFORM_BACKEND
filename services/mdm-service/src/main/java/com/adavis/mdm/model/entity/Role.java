package com.adavis.mdm.model.entity;

import com.fasterxml.jackson.annotation.JsonInclude;
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
@JsonInclude(JsonInclude.Include.NON_NULL)
@Document(collection = "mdm_roles")
public class Role {

    @JsonIgnore
    @Id
    private String id;

    @Indexed(unique = true)
    private String roleId;

    private String tenantId;

    private String roleCode;

    private String roleName;

    private String name;
    private String description;
    private String parentRoleId;
    private Integer level;
    private Boolean isActive;

    private Instant createdAt;
    private Instant updatedAt;
}