package com.adavis.mdm.controller;

import com.adavis.common.dto.ApiResponse;
import com.adavis.mdm.model.entity.GroupRoleAssignment;
import com.adavis.mdm.model.entity.Group;
import com.adavis.mdm.model.entity.UserGroupAssignment;
import com.adavis.mdm.security.InternalRequestValidator;
import com.adavis.mdm.service.GroupMappingService;
import com.adavis.mdm.service.UserGroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/mdm/user-groups")
@RequiredArgsConstructor
public class UserGroupController {

    private static final String INTERNAL_AUTH_HEADER = "X-Internal-Auth";

    private final UserGroupService userGroupService;
    private final GroupMappingService groupMappingService;
    private final InternalRequestValidator internalRequestValidator;

    @PostMapping
    public ResponseEntity<ApiResponse<Group>> createGroup(
            @RequestHeader(value = INTERNAL_AUTH_HEADER, required = false) String internalAuth,
            @Valid @RequestBody Group group) {
        internalRequestValidator.validateInternalGatewayRequest(internalAuth);
        Group created = userGroupService.createGroup(group);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Group created successfully", created));
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<ApiResponse<Group>> getGroup(@PathVariable String groupId) {
        Group group = userGroupService.getGroupByGroupId(groupId);
        return ResponseEntity.ok(ApiResponse.success(group));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Group>>> getAllGroups(
            @RequestParam(required = false) Boolean isActive) {
        List<Group> groups = userGroupService.getAllGroups(isActive);
        return ResponseEntity.ok(ApiResponse.success(groups));
    }

    @PutMapping("/{groupId}")
    public ResponseEntity<ApiResponse<Group>> updateGroup(
            @PathVariable String groupId,
            @RequestHeader(value = INTERNAL_AUTH_HEADER, required = false) String internalAuth,
            @Valid @RequestBody Group group) {
        internalRequestValidator.validateInternalGatewayRequest(internalAuth);
        Group updated = userGroupService.updateGroup(groupId, group);
        return ResponseEntity.ok(ApiResponse.success("Group updated successfully", updated));
    }

    @DeleteMapping("/{groupId}")
    public ResponseEntity<ApiResponse<Void>> deleteGroup(
            @PathVariable String groupId,
            @RequestHeader(value = INTERNAL_AUTH_HEADER, required = false) String internalAuth) {
        internalRequestValidator.validateInternalGatewayRequest(internalAuth);
        userGroupService.deleteGroup(groupId);
        return ResponseEntity.ok(ApiResponse.successMessage("Group deleted successfully"));
    }

    @PostMapping("/{groupId}/deactivate")
    public ResponseEntity<ApiResponse<Void>> deactivateGroup(
            @PathVariable String groupId,
            @RequestHeader(value = INTERNAL_AUTH_HEADER, required = false) String internalAuth) {
        internalRequestValidator.validateInternalGatewayRequest(internalAuth);
        userGroupService.deleteGroup(groupId);
        return ResponseEntity.ok(ApiResponse.successMessage("Group deactivated successfully"));
    }

    @PostMapping("/{groupId}/activate")
    public ResponseEntity<ApiResponse<Group>> reactivateGroup(
            @PathVariable String groupId,
            @RequestHeader(value = INTERNAL_AUTH_HEADER, required = false) String internalAuth) {
        internalRequestValidator.validateInternalGatewayRequest(internalAuth);
        Group reactivated = userGroupService.reactivateGroup(groupId);
        return ResponseEntity.ok(ApiResponse.success("Group reactivated successfully", reactivated));
    }
}