package com.adavis.mdm.controller;

import com.adavis.common.dto.ApiResponse;
import com.adavis.mdm.security.InternalRequestValidator;
import com.adavis.mdm.service.PlantTopologyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/mdm")
@RequiredArgsConstructor
public class TenantGovernanceController {

    private static final String INTERNAL_AUTH_HEADER = "X-Internal-Auth";
    private static final String USER_ID_HEADER = "X-User-Id";

    private final PlantTopologyService plantTopologyService;
    private final InternalRequestValidator internalRequestValidator;

    @PostMapping("/tenants")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createTenant(
            @RequestHeader(value = INTERNAL_AUTH_HEADER, required = false) String internalAuth,
            @RequestHeader(value = USER_ID_HEADER, required = false) String currentUserId,
            @RequestBody Map<String, Object> request) {
        internalRequestValidator.validateInternalGatewayRequest(internalAuth);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tenant created successfully", plantTopologyService.createTenant(request, currentUserId)));
    }

    @GetMapping("/tenants")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listTenants(
            @RequestParam(required = false) Boolean isActive) {
        return ResponseEntity.ok(ApiResponse.success(plantTopologyService.listTenants(isActive)));
    }

    @GetMapping("/tenants/{tenantId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTenant(@PathVariable String tenantId) {
        return ResponseEntity.ok(ApiResponse.success(plantTopologyService.getTenant(tenantId)));
    }

    @PutMapping("/tenants/{tenantId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateTenant(
            @PathVariable String tenantId,
            @RequestHeader(value = INTERNAL_AUTH_HEADER, required = false) String internalAuth,
            @RequestHeader(value = USER_ID_HEADER, required = false) String currentUserId,
            @RequestBody Map<String, Object> request) {
        internalRequestValidator.validateInternalGatewayRequest(internalAuth);
        return ResponseEntity.ok(ApiResponse.success("Tenant updated successfully", plantTopologyService.updateTenant(tenantId, request, currentUserId)));
    }

    @DeleteMapping("/tenants/{tenantId}")
    public ResponseEntity<ApiResponse<Void>> deleteTenant(
            @PathVariable String tenantId,
            @RequestHeader(value = INTERNAL_AUTH_HEADER, required = false) String internalAuth,
            @RequestHeader(value = USER_ID_HEADER, required = false) String currentUserId) {
        internalRequestValidator.validateInternalGatewayRequest(internalAuth);
        plantTopologyService.deleteTenant(tenantId, currentUserId);
        return ResponseEntity.ok(ApiResponse.successMessage("Tenant deleted successfully"));
    }

    @PostMapping("/tenants/{tenantId}/deactivate")
    public ResponseEntity<ApiResponse<Void>> deactivateTenant(
            @PathVariable String tenantId,
            @RequestHeader(value = INTERNAL_AUTH_HEADER, required = false) String internalAuth,
            @RequestHeader(value = USER_ID_HEADER, required = false) String currentUserId) {
        internalRequestValidator.validateInternalGatewayRequest(internalAuth);
        plantTopologyService.deleteTenant(tenantId, currentUserId);
        return ResponseEntity.ok(ApiResponse.successMessage("Tenant deactivated successfully"));
    }

    @PostMapping("/tenants/{tenantId}/activate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> reactivateTenant(
            @PathVariable String tenantId,
            @RequestHeader(value = INTERNAL_AUTH_HEADER, required = false) String internalAuth,
            @RequestHeader(value = USER_ID_HEADER, required = false) String currentUserId) {
        internalRequestValidator.validateInternalGatewayRequest(internalAuth);
        return ResponseEntity.ok(ApiResponse.success("Tenant reactivated successfully", plantTopologyService.reactivateTenant(tenantId, currentUserId)));
    }

}