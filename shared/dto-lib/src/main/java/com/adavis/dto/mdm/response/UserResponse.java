package com.adavis.dto.mdm.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private String userId;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String fullName;
    private String departmentId;
    private String departmentName;
    private String designation;
    private Boolean isActive;
    private Boolean isExternal;
    private Instant createdAt;
    private Instant updatedAt;
}