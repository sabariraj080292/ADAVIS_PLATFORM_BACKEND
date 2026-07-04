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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/mdm/assignments")
@RequiredArgsConstructor
public class AssignmentController {

    private static final String INTERNAL_AUTH_HEADER = "X-Internal-Auth";

    private final PlantTopologyService plantTopologyService;
    private final InternalRequestValidator internalRequestValidator;

    @PostMapping("/grant")
    public ResponseEntity<ApiResponse<Map<String, Object>>> grant(
            @RequestHeader(value = INTERNAL_AUTH_HEADER, required = false) String internalAuth,
            @RequestBody Map<String, Object> request) {
        internalRequestValidator.validateInternalGatewayRequest(internalAuth);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Assignment granted successfully", plantTopologyService.createAssignment(request)));
    }

    @PostMapping("/exclude")
    public ResponseEntity<ApiResponse<Map<String, Object>>> exclude(
            @RequestHeader(value = INTERNAL_AUTH_HEADER, required = false) String internalAuth,
            @RequestBody Map<String, Object> request) {
        internalRequestValidator.validateInternalGatewayRequest(internalAuth);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Assignment exclusion created successfully", plantTopologyService.createExclusion(request)));
    }

    @PostMapping("/iiot/grant")
    public ResponseEntity<ApiResponse<Map<String, Object>>> iiotGrant(
            @RequestHeader(value = INTERNAL_AUTH_HEADER, required = false) String internalAuth,
            @RequestBody Map<String, Object> request) {
        internalRequestValidator.validateInternalGatewayRequest(internalAuth);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("IIOT assignment granted successfully", plantTopologyService.createIiotAssignment(request)));
    }

    @PostMapping("/iiot/exclude")
    public ResponseEntity<ApiResponse<Map<String, Object>>> iiotExclude(
            @RequestHeader(value = INTERNAL_AUTH_HEADER, required = false) String internalAuth,
            @RequestBody Map<String, Object> request) {
        internalRequestValidator.validateInternalGatewayRequest(internalAuth);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("IIOT assignment exclusion created successfully", plantTopologyService.createIiotExclusion(request)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listAssignments(
            @RequestParam(required = false) Boolean isActive) {
        return ResponseEntity.ok(ApiResponse.success(plantTopologyService.listAssignments(isActive)));
    }

    @DeleteMapping("/{assignmentId}")
    public ResponseEntity<ApiResponse<Void>> deleteAssignment(
            @PathVariable String assignmentId,
            @RequestHeader(value = INTERNAL_AUTH_HEADER, required = false) String internalAuth) {
        internalRequestValidator.validateInternalGatewayRequest(internalAuth);
        plantTopologyService.deleteAssignment(assignmentId);
        return ResponseEntity.ok(ApiResponse.successMessage("Assignment deleted successfully"));
    }

    @PostMapping("/{assignmentId}/activate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> reactivateAssignment(
            @PathVariable String assignmentId,
            @RequestHeader(value = INTERNAL_AUTH_HEADER, required = false) String internalAuth) {
        internalRequestValidator.validateInternalGatewayRequest(internalAuth);
        return ResponseEntity.ok(ApiResponse.success("Assignment reactivated successfully", plantTopologyService.reactivateAssignment(assignmentId)));
    }
}
