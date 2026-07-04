package com.adavis.dto.mdm.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupSearchRequest {

    private String searchTerm;
    private Boolean isActive;
    private Integer page;
    private Integer size;
    private String sortBy;
    private String sortDirection;
}