package com.adavis.dto.mdm.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSearchRequest {

    private String searchTerm;
    private String departmentId;
    private String status;
    private Boolean isActive;
    private Boolean isExternal;
    private Integer page;
    private Integer size;
    private String sortBy;
    private String sortDirection;
}