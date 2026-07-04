package com.adavis.dto.mdm.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupResponse {

    private String groupId;
    private String name;
    private String description;
    private Boolean isActive;
    private Integer memberCount;
    private List<String> roleIds;
    private Instant createdAt;
    private Instant updatedAt;
}