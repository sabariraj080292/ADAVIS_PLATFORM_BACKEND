package com.adavis.dto.auth.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginInitiateRequest {

    @NotBlank(message = "Identifier (userId or email) is required")
    private String identifier; // userId or email
}
