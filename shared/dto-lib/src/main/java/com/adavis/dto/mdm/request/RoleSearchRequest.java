package com.adavis.dto.mdm.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleSearchRequest {

    private String searchTerm;
    private String parentRoleId;
    private Boolean isActive;
    private Integer page;
    private Integer size;
    private String sortBy;
    private String sortDirection;
}