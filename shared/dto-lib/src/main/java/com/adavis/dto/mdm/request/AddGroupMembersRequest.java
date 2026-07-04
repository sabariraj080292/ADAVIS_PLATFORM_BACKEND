package com.adavis.dto.mdm.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddGroupMembersRequest {

    @NotEmpty(message = "User IDs are required")
    private List<String> userIds;
}