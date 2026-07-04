package com.adavis.license.controller;

import com.adavis.common.dto.ApiResponse;
import com.adavis.dto.license.request.ApplyLicenseRequest;
import com.adavis.dto.license.response.LicenseResponse;
import com.adavis.license.model.entity.LicenseHistory;
import com.adavis.license.service.LicenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/mdm/license")
@RequiredArgsConstructor
public class LicenseController {

    private final LicenseService licenseService;

    @PostMapping("/tenant")
    public ApiResponse<LicenseResponse> activateLicense(@Valid @RequestBody ApplyLicenseRequest request) {
        LicenseResponse response = licenseService.applyLicense(request);
        return ApiResponse.success("License action applied successfully", response);
    }

    @GetMapping("/tenant/{tenantId}")
    public ApiResponse<LicenseResponse> getTenantLicense(@PathVariable String tenantId) {
        return ApiResponse.success(licenseService.getActiveLicenseByTenantId(tenantId));
    }

    @PutMapping("/{licenseId}/upgrade")
    public ApiResponse<LicenseResponse> upgradeLicense(
            @PathVariable String licenseId,
            @RequestBody Map<String, Object> request) {
        return ApiResponse.success(
                "License action applied successfully",
                licenseService.upgradeLicenseById(
                        licenseId,
                    toText(request.get("encryptedLicenseToken")),
                        toStringList(request.get("modules")),
                        toInteger(request.get("maxUsers")),
                        toText(request.get("reason")),
                        toText(request.get("upgradedBy"))));
    }

                @PutMapping("/tenant/{tenantId}/upgrade")
                public ApiResponse<LicenseResponse> upgradeLicenseByTenant(
                    @PathVariable String tenantId,
                    @RequestBody Map<String, Object> request) {
                return ApiResponse.success(
                    "License action applied successfully",
                    licenseService.upgradeLicenseByTenantId(
                        tenantId,
                        toText(request.get("encryptedLicenseToken")),
                        toStringList(request.get("modules")),
                        toInteger(request.get("maxUsers")),
                        toText(request.get("reason")),
                        toText(request.get("upgradedBy"))));
                }

    @GetMapping("/tenant/{tenantId}/history")
    public ApiResponse<List<LicenseHistory>> getTenantLicenseHistory(@PathVariable String tenantId) {
        return ApiResponse.success(licenseService.getLicenseHistoryByTenantId(tenantId));
    }

    @SuppressWarnings("unchecked")
    private List<String> toStringList(Object value) {
        if (value instanceof List<?> list) {
            return list.stream().map(String::valueOf).toList();
        }
        return null;
    }

    private Integer toInteger(Object value) {
        if (value instanceof Number number) {
            return number.intValue();
        }
        if (value instanceof String text && !text.isBlank()) {
            return Integer.parseInt(text);
        }
        return null;
    }

    private String toText(Object value) {
        return value == null ? null : String.valueOf(value);
    }
}