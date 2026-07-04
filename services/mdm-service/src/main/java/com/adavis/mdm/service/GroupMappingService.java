package com.adavis.mdm.service;

import com.adavis.common.exception.BusinessException;
import com.adavis.common.exception.ResourceNotFoundException;
import com.adavis.mdm.model.entity.Group;
import com.adavis.mdm.model.entity.GroupRoleAssignment;
import com.adavis.mdm.model.entity.Role;
import com.adavis.mdm.model.entity.UserGroupAssignment;
import com.adavis.mdm.model.entity.UserProfile;
import com.adavis.mdm.repository.GroupRepository;
import com.adavis.mdm.repository.GroupRoleAssignmentRepository;
import com.adavis.mdm.repository.RoleRepository;
import com.adavis.mdm.repository.UserGroupAssignmentRepository;
import com.adavis.mdm.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class GroupMappingService {

    private final GroupRepository groupRepository;
    private final RoleRepository roleRepository;
    private final UserProfileRepository userProfileRepository;
    private final GroupRoleAssignmentRepository groupRoleAssignmentRepository;
    private final UserGroupAssignmentRepository userGroupAssignmentRepository;
    private final AuditEventPublisher auditEventPublisher;

    public GroupRoleAssignment mapRoleToGroup(String groupId, String roleId, String assignedBy) {
        Group group = getActiveGroup(groupId);
        Role role = getActiveRole(roleId);

        GroupRoleAssignment assignment = groupRoleAssignmentRepository.findByGroupIdAndRoleId(groupId, roleId)
                .orElseGet(() -> GroupRoleAssignment.builder().groupId(groupId).roleId(roleId).build());

        if (Boolean.TRUE.equals(assignment.getIsActive())) {
            throw new BusinessException("Role already mapped to group", "DUPLICATE_RESOURCE");
        }

        assignment.setIsActive(true);
        assignment.setAssignedAt(Instant.now());
        assignment.setAssignedBy((assignedBy == null || assignedBy.isBlank()) ? "SYSTEM" : assignedBy.trim());

        GroupRoleAssignment saved = groupRoleAssignmentRepository.save(assignment);
        auditEventPublisher.publish(
                saved.getAssignedBy(),
                "GROUP_ROLE_MAPPED",
                "MDM_GROUP_ROLE_ASSIGNMENT",
                groupId,
                "SUCCESS",
                Map.of(
                        "roleId", roleId,
                        "groupCode", group.getGroupCode() == null ? "" : group.getGroupCode(),
                        "roleCode", role.getRoleCode() == null ? "" : role.getRoleCode()));
        return saved;
    }

    public void unmapRoleFromGroup(String groupId, String roleId, String removedBy) {
        GroupRoleAssignment assignment = groupRoleAssignmentRepository.findByGroupIdAndRoleId(groupId, roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Group-role mapping not found"));

        if (!Boolean.TRUE.equals(assignment.getIsActive())) {
            return;
        }

        assignment.setIsActive(false);
        assignment.setAssignedBy((removedBy == null || removedBy.isBlank()) ? "SYSTEM" : removedBy.trim());
        assignment.setAssignedAt(Instant.now());
        groupRoleAssignmentRepository.save(assignment);

        auditEventPublisher.publish(
                assignment.getAssignedBy(),
                "GROUP_ROLE_UNMAPPED",
                "MDM_GROUP_ROLE_ASSIGNMENT",
                groupId,
                "SUCCESS",
                Map.of("roleId", roleId));
    }

    public List<GroupRoleAssignment> getGroupRoleMappings(String groupId, Boolean isActive) {
        getGroup(groupId);
        if (isActive == null) {
            return groupRoleAssignmentRepository.findByGroupIdAndIsActiveTrue(groupId);
        }
        return groupRoleAssignmentRepository.findByGroupIdAndIsActive(groupId, isActive);
    }

    public UserGroupAssignment mapUserToGroup(String groupId, String userId, String assignedBy) {
        Group group = getActiveGroup(groupId);
        UserProfile user = getActiveUser(userId);

        UserGroupAssignment assignment = userGroupAssignmentRepository.findByUserIdAndGroupId(userId, groupId)
                .orElseGet(() -> UserGroupAssignment.builder().userId(userId).groupId(groupId).build());

        if (Boolean.TRUE.equals(assignment.getIsActive())) {
            throw new BusinessException("User already mapped to group", "DUPLICATE_RESOURCE");
        }
        assignment.setIsActive(true);
        assignment.setAssignedAt(Instant.now());
        assignment.setAssignedBy((assignedBy == null || assignedBy.isBlank()) ? "SYSTEM" : assignedBy.trim());

        UserGroupAssignment saved = userGroupAssignmentRepository.save(assignment);
        auditEventPublisher.publish(
                saved.getAssignedBy(),
                "USER_GROUP_MAPPED",
                "MDM_USER_GROUP_ASSIGNMENT",
                userId,
                "SUCCESS",
                Map.of(
                        "groupId", groupId,
                        "groupCode", group.getGroupCode() == null ? "" : group.getGroupCode(),
                        "userTrackId", user.getUserTrackId() == null ? "" : user.getUserTrackId()));
        return saved;
    }

    public void unmapUserFromGroup(String groupId, String userId, String removedBy) {
        UserGroupAssignment assignment = userGroupAssignmentRepository.findByUserIdAndGroupId(userId, groupId)
                .orElseThrow(() -> new ResourceNotFoundException("User-group mapping not found"));

        if (!Boolean.TRUE.equals(assignment.getIsActive())) {
            return;
        }

        assignment.setIsActive(false);
        assignment.setAssignedBy((removedBy == null || removedBy.isBlank()) ? "SYSTEM" : removedBy.trim());
        assignment.setAssignedAt(Instant.now());
        userGroupAssignmentRepository.save(assignment);

        auditEventPublisher.publish(
                assignment.getAssignedBy(),
                "USER_GROUP_UNMAPPED",
                "MDM_USER_GROUP_ASSIGNMENT",
                userId,
                "SUCCESS",
                Map.of("groupId", groupId));
    }

    public List<UserGroupAssignment> getGroupUserMappings(String groupId, Boolean isActive) {
        getGroup(groupId);
        if (isActive == null) {
            return userGroupAssignmentRepository.findByGroupIdAndIsActiveTrue(groupId);
        }
        return userGroupAssignmentRepository.findByGroupIdAndIsActive(groupId, isActive);
    }

    private Group getGroup(String groupId) {
        return groupRepository.findByGroupId(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found with id: " + groupId));
    }

    private Group getActiveGroup(String groupId) {
        Group group = getGroup(groupId);
        if (!Boolean.TRUE.equals(group.getIsActive())) {
            throw new BusinessException("Group is not active", "RESOURCE_INACTIVE");
        }
        return group;
    }

    private Role getActiveRole(String roleId) {
        Role role = roleRepository.findByRoleId(roleId)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found with id: " + roleId));
        if (!Boolean.TRUE.equals(role.getIsActive())) {
            throw new BusinessException("Role is not active", "RESOURCE_INACTIVE");
        }
        return role;
    }

    private UserProfile getActiveUser(String userId) {
        UserProfile user = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        if (!Boolean.TRUE.equals(user.getIsActive()) || Boolean.TRUE.equals(user.getIsBlocked())) {
            throw new BusinessException("User is not active", "RESOURCE_INACTIVE");
        }
        return user;
    }
}
