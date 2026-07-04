package com.adavis.mdm.controller;

import com.adavis.common.dto.ApiResponse;
import com.adavis.mdm.model.entity.GroupRoleAssignment;
import com.adavis.mdm.model.entity.UserGroupAssignment;
import com.adavis.mdm.security.InternalRequestValidator;
import com.adavis.mdm.service.GroupMappingService;
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
@RequestMapping("/api/v1/mdm/user-groups")
@RequiredArgsConstructor
public class GroupMappingController {

    private static final String INTERNAL_AUTH_HEADER = "X-Internal-Auth";

    private final GroupMappingService groupMappingService;
    private final InternalRequestValidator internalRequestValidator;

    @PostMapping("/{groupId}/roles")
    public ResponseEntity<ApiResponse<GroupRoleAssignment>> mapRoleToGroup(
            @PathVariable String groupId,
            @RequestHeader(value = INTERNAL_AUTH_HEADER, required = false) String internalAuth,
            @RequestBody Map<String, Object> request) {
        internalRequestValidator.validateInternalGatewayRequest(internalAuth);
        GroupRoleAssignment mapping = groupMappingService.mapRoleToGroup(
                groupId,
                toText(request.get("roleId")),
                toText(request.get("assignedBy")));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Role mapped to group successfully", mapping));
    }

    @GetMapping("/{groupId}/roles")
    public ResponseEntity<ApiResponse<List<GroupRoleAssignment>>> getGroupRoleMappings(
            @PathVariable String groupId,
            @RequestParam(required = false) Boolean isActive) {
        return ResponseEntity.ok(ApiResponse.success(groupMappingService.getGroupRoleMappings(groupId, isActive)));
    }

    @DeleteMapping("/{groupId}/roles/{roleId}")
    public ResponseEntity<ApiResponse<Void>> unmapRoleFromGroup(
            @PathVariable String groupId,
            @PathVariable String roleId,
            @RequestHeader(value = INTERNAL_AUTH_HEADER, required = false) String internalAuth,
            @RequestParam(required = false) String removedBy) {
        internalRequestValidator.validateInternalGatewayRequest(internalAuth);
        groupMappingService.unmapRoleFromGroup(groupId, roleId, removedBy);
        return ResponseEntity.ok(ApiResponse.successMessage("Role unmapped from group successfully"));
    }

    @PostMapping("/{groupId}/users")
    public ResponseEntity<ApiResponse<UserGroupAssignment>> mapUserToGroup(
            @PathVariable String groupId,
            @RequestHeader(value = INTERNAL_AUTH_HEADER, required = false) String internalAuth,
            @RequestBody Map<String, Object> request) {
        internalRequestValidator.validateInternalGatewayRequest(internalAuth);
        UserGroupAssignment mapping = groupMappingService.mapUserToGroup(
                groupId,
                toText(request.get("userId")),
                toText(request.get("assignedBy")));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User mapped to group successfully", mapping));
    }

    @GetMapping("/{groupId}/users")
    public ResponseEntity<ApiResponse<List<UserGroupAssignment>>> getGroupUserMappings(
            @PathVariable String groupId,
            @RequestParam(required = false) Boolean isActive) {
        return ResponseEntity.ok(ApiResponse.success(groupMappingService.getGroupUserMappings(groupId, isActive)));
    }

    @DeleteMapping("/{groupId}/users/{userId}")
    public ResponseEntity<ApiResponse<Void>> unmapUserFromGroup(
            @PathVariable String groupId,
            @PathVariable String userId,
            @RequestHeader(value = INTERNAL_AUTH_HEADER, required = false) String internalAuth,
            @RequestParam(required = false) String removedBy) {
        internalRequestValidator.validateInternalGatewayRequest(internalAuth);
        groupMappingService.unmapUserFromGroup(groupId, userId, removedBy);
        return ResponseEntity.ok(ApiResponse.successMessage("User unmapped from group successfully"));
    }

    private String toText(Object value) {
        return value == null ? null : String.valueOf(value);
    }

}