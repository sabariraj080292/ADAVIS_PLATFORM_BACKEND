package com.adavis.mdm.service;

import com.adavis.common.exception.BusinessException;
import com.adavis.mdm.model.entity.RolePermission;
import com.adavis.mdm.repository.RolePermissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class RolePermissionService {

    private final RoleService roleService;
    private final RolePermissionRepository rolePermissionRepository;
    private final AuditEventPublisher auditEventPublisher;

    public RolePermission saveRolePermissions(String roleId, RolePermission rolePermission) {
        roleService.getRoleByRoleId(roleId);

        rolePermission.setRoleId(roleId);
        if (rolePermission.getIsActive() == null) {
            rolePermission.setIsActive(true);
        }
        if (rolePermission.getVersion() == null || rolePermission.getVersion() < 1) {
            rolePermission.setVersion(1);
        }

        Optional<RolePermission> existing = rolePermissionRepository.findByRoleIdAndModuleId(roleId, rolePermission.getModuleId());
        existing.ifPresent(value -> rolePermission.setId(value.getId()));

        RolePermission saved = rolePermissionRepository.save(rolePermission);
        auditEventPublisher.publish(
                "SYSTEM",
                "ROLE_PERMISSION_SAVED",
                "MDM_ROLE_PERMISSION",
                roleId,
                "SUCCESS",
                Map.of("moduleId", saved.getModuleId() == null ? "" : saved.getModuleId()));
        return saved;
    }

    public List<RolePermission> getRolePermissions(String roleId, Boolean isActive) {
        roleService.getRoleByRoleId(roleId);
        if (isActive == null) {
            return rolePermissionRepository.findByRoleIdAndIsActiveTrue(roleId);
        }
        return rolePermissionRepository.findByRoleIdAndIsActive(roleId, isActive);
    }

    public void deactivateRolePermissionsByModule(String roleId, String moduleId) {
        RolePermission permission = rolePermissionRepository.findByRoleIdAndModuleId(roleId, moduleId)
                .orElseThrow(() -> new BusinessException("Role permission not found for module: " + moduleId, "RESOURCE_NOT_FOUND"));
        permission.setIsActive(false);
        rolePermissionRepository.save(permission);
        auditEventPublisher.publish(
                "SYSTEM",
                "ROLE_PERMISSION_DEACTIVATED",
                "MDM_ROLE_PERMISSION",
                roleId,
                "SUCCESS",
                Map.of("moduleId", moduleId));
    }
}
