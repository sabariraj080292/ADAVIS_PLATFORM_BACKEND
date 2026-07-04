package com.adavis.dto.license.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplyLicenseRequest {

    @NotBlank(message = "actionType is required")
    @Pattern(
            regexp = "^(ACTIVATE|UPGRADE|RENEW|SUSPEND|REACTIVATE)$",
            message = "actionType must be one of ACTIVATE, UPGRADE, RENEW, SUSPEND, REACTIVATE"
    )
    private String actionType;

    @NotBlank(message = "encryptedLicenseToken is required")
    private String encryptedLicenseToken;

    private String performedBy;

    private String reason;
}
