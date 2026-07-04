package com.adavis.dto.mdm.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignRoleRequest {

    @NotBlank(message = "Role ID is required")
    private String roleId;

    @NotBlank(message = "Group ID is required")
    private String groupId;
}