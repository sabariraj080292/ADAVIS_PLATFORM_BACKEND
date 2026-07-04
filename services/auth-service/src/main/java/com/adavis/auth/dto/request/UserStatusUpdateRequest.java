package com.adavis.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStatusUpdateRequest {

    @NotBlank(message = "User ID is required")
    private String userId;

    @NotBlank(message = "Status is required")
    private String status;

    private Boolean isLocked;
}