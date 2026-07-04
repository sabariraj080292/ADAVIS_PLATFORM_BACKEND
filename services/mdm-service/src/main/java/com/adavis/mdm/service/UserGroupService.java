package com.adavis.mdm.service;

import com.adavis.common.exception.BusinessException;
import com.adavis.common.exception.ResourceNotFoundException;
import com.adavis.mdm.model.entity.Group;
import com.adavis.mdm.model.entity.UserGroupAssignment;
import com.adavis.mdm.repository.GroupRepository;
import com.adavis.mdm.repository.UserGroupAssignmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class UserGroupService {

    private final GroupRepository groupRepository;
    private final UserGroupAssignmentRepository userGroupAssignmentRepository;
    private final BusinessIdGeneratorService businessIdGeneratorService;
    private final AuditEventPublisher auditEventPublisher;

    @CacheEvict(value = "groups", allEntries = true)
    public Group createGroup(Group group) {
        if (!StringUtils.hasText(group.getTenantId())) {
            throw new BusinessException("tenantId is required", "TENANT_ID_REQUIRED");
        }
        if (!StringUtils.hasText(group.getGroupCode())) {
            throw new BusinessException("groupCode is required", "GROUP_CODE_REQUIRED");
        }

        group.setGroupId(businessIdGeneratorService.nextId("mdm_user_groups", "groupId", "GRP-", 4));
        if (groupRepository.existsByGroupId(group.getGroupId())) {
            throw new BusinessException("Group ID already exists: " + group.getGroupId(), "DUPLICATE_GROUP");
        }

        if (groupRepository.existsByTenantIdAndGroupCode(group.getTenantId(), group.getGroupCode())) {
            throw new BusinessException("groupCode already exists: " + group.getGroupCode(), "DUPLICATE_RESOURCE");
        }

        normalizeGroupFields(group);

        group.setIsActive(true);
        group.setCreatedAt(Instant.now());
        group.setUpdatedAt(Instant.now());

        log.info("Creating group: {}", group.getGroupId());
        Group saved = groupRepository.save(group);
        auditEventPublisher.publish(
                "SYSTEM",
                "GROUP_CREATED",
                "MDM_GROUP",
                saved.getGroupId(),
                "SUCCESS",
                metadataOf("groupCode", saved.getGroupCode()));
        return saved;
    }

    @Cacheable(value = "groups", key = "#groupId")
    public Group getGroupByGroupId(String groupId) {
        return groupRepository.findByGroupId(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found with id: " + groupId));
    }

    public List<Group> getAllGroups() {
        return getAllGroups(null);
    }

    public List<Group> getAllGroups(Boolean isActive) {
        if (isActive == null) {
            return groupRepository.findByIsActiveTrue();
        }
        return groupRepository.findByIsActive(isActive);
    }

    @CacheEvict(value = "groups", key = "#groupId")
    public Group updateGroup(String groupId, Group updatedGroup) {
        Group existing = getGroupByGroupId(groupId);

        String tenantId = StringUtils.hasText(updatedGroup.getTenantId()) ? updatedGroup.getTenantId() : existing.getTenantId();
        String groupCode = StringUtils.hasText(updatedGroup.getGroupCode()) ? updatedGroup.getGroupCode() : existing.getGroupCode();
        if (!StringUtils.hasText(tenantId)) {
            throw new BusinessException("tenantId is required", "TENANT_ID_REQUIRED");
        }
        if (!StringUtils.hasText(groupCode)) {
            throw new BusinessException("groupCode is required", "GROUP_CODE_REQUIRED");
        }

        if (groupRepository.existsByTenantIdAndGroupCodeAndGroupIdNot(
                tenantId,
                groupCode,
                groupId)) {
            throw new BusinessException("groupCode already exists: " + groupCode, "DUPLICATE_RESOURCE");
        }

        existing.setTenantId(updatedGroup.getTenantId());
        existing.setGroupCode(updatedGroup.getGroupCode());
        existing.setGroupName(StringUtils.hasText(updatedGroup.getGroupName()) ? updatedGroup.getGroupName() : updatedGroup.getName());
        existing.setName(updatedGroup.getName());
        if (!StringUtils.hasText(existing.getName())) {
            existing.setName(existing.getGroupName());
        }
        existing.setDescription(updatedGroup.getDescription());
        if (updatedGroup.getIsActive() != null) {
            existing.setIsActive(updatedGroup.getIsActive());
        }
        existing.setUpdatedAt(Instant.now());

        log.info("Updating group: {}", groupId);
        Group saved = groupRepository.save(existing);
        auditEventPublisher.publish(
                "SYSTEM",
                "GROUP_UPDATED",
                "MDM_GROUP",
                saved.getGroupId(),
                "SUCCESS",
                metadataOf("groupCode", saved.getGroupCode()));
        return saved;
    }

    @CacheEvict(value = "groups", key = "#groupId")
    public void deleteGroup(String groupId) {
        Group group = getGroupByGroupId(groupId);
        
        List<UserGroupAssignment> members = userGroupAssignmentRepository.findByGroupIdAndIsActiveTrue(groupId);
        if (!members.isEmpty()) {
            throw new BusinessException("Cannot delete group with active members", "GROUP_HAS_MEMBERS");
        }

        group.setIsActive(false);
        group.setUpdatedAt(Instant.now());
        groupRepository.save(group);
        auditEventPublisher.publish("SYSTEM", "GROUP_DELETED", "MDM_GROUP", group.getGroupId(), "SUCCESS", Map.of());
        log.info("Deleted group: {}", groupId);
    }

    @CacheEvict(value = "groups", key = "#groupId")
    public Group reactivateGroup(String groupId) {
        Group group = getGroupByGroupId(groupId);
        group.setIsActive(true);
        group.setUpdatedAt(Instant.now());
        Group saved = groupRepository.save(group);
        auditEventPublisher.publish("SYSTEM", "GROUP_REACTIVATED", "MDM_GROUP", saved.getGroupId(), "SUCCESS", Map.of());
        return saved;
    }

    private void normalizeGroupFields(Group group) {
        if (!StringUtils.hasText(group.getGroupName()) && StringUtils.hasText(group.getName())) {
            group.setGroupName(group.getName());
        }
        if (!StringUtils.hasText(group.getName()) && StringUtils.hasText(group.getGroupName())) {
            group.setName(group.getGroupName());
        }
    }

    private Map<String, Object> metadataOf(String key, String value) {
        if (!StringUtils.hasText(value)) {
            return Map.of();
        }
        return Map.of(key, value);
    }
}