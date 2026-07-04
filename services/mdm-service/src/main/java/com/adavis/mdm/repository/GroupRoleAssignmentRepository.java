package com.adavis.mdm.repository;

import com.adavis.mdm.model.entity.GroupRoleAssignment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupRoleAssignmentRepository extends MongoRepository<GroupRoleAssignment, String> {

    /**
     * Find active group role assignments by group IDs
     * @param groupIds List of group IDs
     * @return List of active GroupRoleAssignment entities
     */
    List<GroupRoleAssignment> findByGroupIdInAndIsActiveTrue(List<String> groupIds);

    List<GroupRoleAssignment> findByRoleIdAndIsActiveTrue(String roleId);

    List<GroupRoleAssignment> findByGroupIdAndIsActiveTrue(String groupId);

    List<GroupRoleAssignment> findByGroupIdAndIsActive(String groupId, Boolean isActive);

    List<GroupRoleAssignment> findByRoleIdAndIsActive(String roleId, Boolean isActive);

    Optional<GroupRoleAssignment> findByGroupIdAndRoleId(String groupId, String roleId);

    void deleteByGroupId(String groupId);

    void deleteByRoleId(String roleId);

    boolean existsByGroupIdAndRoleIdAndIsActiveTrue(String groupId, String roleId);
}