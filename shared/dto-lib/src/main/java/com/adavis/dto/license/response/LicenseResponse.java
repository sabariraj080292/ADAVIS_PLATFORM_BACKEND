package com.adavis.dto.license.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LicenseResponse implements Serializable {

    private static final long serialVersionUID = 1L;

    private String id;
    private String licenseKey;
    private String planId;
    private String planName;
    private String planType;
    private List<String> modules;
    private Integer maxUsers;
    private Integer currentUsers;
    private String status;
    private Instant startDate;
    private Instant expiryDate;
    private Map<String, Object> metadata;
    private Instant createdAt;
    private Instant updatedAt;
}