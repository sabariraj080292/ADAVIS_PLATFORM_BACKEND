package com.adavis.dto.license.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidateLicenseRequest {

    private String licenseKey;
    private String moduleId;
    private Integer currentUserCount;
}