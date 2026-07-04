package com.adavis.mdm.controller;

import com.adavis.common.dto.ApiResponse;
import com.adavis.mdm.model.entity.Department;
import com.adavis.mdm.security.InternalRequestValidator;
import com.adavis.mdm.service.DepartmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/mdm/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private static final String INTERNAL_AUTH_HEADER = "X-Internal-Auth";

    private final DepartmentService departmentService;
    private final InternalRequestValidator internalRequestValidator;

    @PostMapping
    public ResponseEntity<ApiResponse<Department>> createDepartment(
            @RequestHeader(value = INTERNAL_AUTH_HEADER, required = false) String internalAuth,
            @Valid @RequestBody Department department) {
        internalRequestValidator.validateInternalGatewayRequest(internalAuth);
        Department created = departmentService.createDepartment(department);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Department created successfully", created));
    }

    @GetMapping({"", "/tree"})
    public ResponseEntity<ApiResponse<List<Department>>> getAllDepartments(
            @RequestParam(required = false) Boolean isActive) {
        List<Department> departments = departmentService.getAllDepartments(isActive);
        return ResponseEntity.ok(ApiResponse.success(departments));
    }

    @PutMapping("/{departmentId}")
    public ResponseEntity<ApiResponse<Department>> updateDepartment(
            @PathVariable String departmentId,
            @RequestHeader(value = INTERNAL_AUTH_HEADER, required = false) String internalAuth,
            @Valid @RequestBody Department department) {
        internalRequestValidator.validateInternalGatewayRequest(internalAuth);
        Department updated = departmentService.updateDepartment(departmentId, department);
        return ResponseEntity.ok(ApiResponse.success("Department updated successfully", updated));
    }

    @DeleteMapping("/{departmentId}")
    public ResponseEntity<ApiResponse<Void>> deleteDepartment(
            @PathVariable String departmentId,
            @RequestHeader(value = INTERNAL_AUTH_HEADER, required = false) String internalAuth) {
        internalRequestValidator.validateInternalGatewayRequest(internalAuth);
        departmentService.deleteDepartment(departmentId);
        return ResponseEntity.ok(ApiResponse.successMessage("Department deleted successfully"));
    }

    @PostMapping("/{departmentId}/deactivate")
    public ResponseEntity<ApiResponse<Void>> deactivateDepartment(
            @PathVariable String departmentId,
            @RequestHeader(value = INTERNAL_AUTH_HEADER, required = false) String internalAuth) {
        internalRequestValidator.validateInternalGatewayRequest(internalAuth);
        departmentService.deleteDepartment(departmentId);
        return ResponseEntity.ok(ApiResponse.successMessage("Department deactivated successfully"));
    }

    @PostMapping("/{departmentId}/activate")
    public ResponseEntity<ApiResponse<Department>> reactivateDepartment(
            @PathVariable String departmentId,
            @RequestHeader(value = INTERNAL_AUTH_HEADER, required = false) String internalAuth) {
        internalRequestValidator.validateInternalGatewayRequest(internalAuth);
        Department reactivated = departmentService.reactivateDepartment(departmentId);
        return ResponseEntity.ok(ApiResponse.success("Department reactivated successfully", reactivated));
    }
}