package com.adavis.dto.mdm.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentResponse {

    private String departmentId;
    private String name;
    private String description;
    private String parentDepartmentId;
    private String parentDepartmentName;
    private Integer level;
    private Boolean isActive;
    private Integer userCount;
}