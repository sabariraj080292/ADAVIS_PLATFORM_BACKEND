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
public class UpdateDepartmentRequest {

    @NotBlank(message = "Department name is required")
    private String name;

    private String description;
    private String parentDepartmentId;
    private Boolean isActive;
}