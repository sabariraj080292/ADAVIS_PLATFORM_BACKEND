package com.adavis.mdm.repository;

import com.adavis.mdm.model.entity.RolePermission;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface RolePermissionRepository extends MongoRepository<RolePermission, String> {

    Optional<RolePermission> findByRoleIdAndModuleId(String roleId, String moduleId);

    List<RolePermission> findByRoleId(String roleId);

    List<RolePermission> findByRoleIdAndIsActiveTrue(String roleId);

    List<RolePermission> findByRoleIdAndIsActive(String roleId, Boolean isActive);

    List<RolePermission> findByEffectiveFromLessThanEqualAndEffectiveToGreaterThanEqual(Instant from, Instant to);
}