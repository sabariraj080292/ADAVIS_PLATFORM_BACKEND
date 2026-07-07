package com.adavis.license.controller;

import com.adavis.common.dto.ApiResponse;
import com.adavis.dto.license.request.ValidateLicenseRequest;
import com.adavis.dto.license.response.LicenseResponse;
import com.adavis.dto.license.response.ModuleResponse;
import com.adavis.license.service.LicenseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/internal/v1/mdm/license")
@RequiredArgsConstructor
public class InternalLicenseController {

    private final LicenseService licenseService;

    @PostMapping("/tenant/{tenantId}/validate")
    public ApiResponse<Boolean> validateTenantLicense(
            @PathVariable String tenantId,
            @Valid @RequestBody ValidateLicenseRequest request) {
        return ApiResponse.success(licenseService.validateLicenseByTenantId(tenantId, request));
    }

    @PatchMapping("/tenant/{tenantId}/user-count")
    public ApiResponse<LicenseResponse> updateTenantUserCount(
            @PathVariable String tenantId,
            @RequestParam Integer userCount) {
        return ApiResponse.success("User count updated successfully", licenseService.updateUserCountByTenantId(tenantId, userCount));
    }

    @PostMapping("/tenant/{tenantId}/user-count")
    public ApiResponse<LicenseResponse> updateTenantUserCountViaPost(
            @PathVariable String tenantId,
            @RequestParam Integer userCount) {
        return ApiResponse.success("User count updated successfully", licenseService.updateUserCountByTenantId(tenantId, userCount));
    }

    @GetMapping("/tenant/{tenantId}/modules")
    public ApiResponse<ModuleResponse> getTenantModules(@PathVariable String tenantId) {
        return ApiResponse.success(licenseService.getModulesByTenantId(tenantId));
    }

    @GetMapping("/tenant/{tenantId}/key")
    public ApiResponse<java.util.Map<String, Object>> getTenantLicenseKey(@PathVariable String tenantId) {
        return ApiResponse.success(licenseService.getInternalLicenseKeyByTenantId(tenantId));
    }
}