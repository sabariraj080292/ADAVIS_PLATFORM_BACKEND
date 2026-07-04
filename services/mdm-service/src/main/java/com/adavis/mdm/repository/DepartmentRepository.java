package com.adavis.mdm.repository;

import com.adavis.mdm.model.entity.Department;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends MongoRepository<Department, String> {

    Optional<Department> findByDepartmentId(String departmentId);

    List<Department> findByIsActiveTrue();

    List<Department> findByIsActive(Boolean isActive);

    List<Department> findByParentDepartmentId(String parentDepartmentId);

    List<Department> findByParentDepartmentIdAndIsActiveTrue(String parentDepartmentId);

    boolean existsByDepartmentId(String departmentId);

    boolean existsByTenantIdAndPlantIdAndDepartmentCode(String tenantId, String plantId, String departmentCode);

    boolean existsByTenantIdAndPlantIdAndDepartmentCodeAndDepartmentIdNot(String tenantId,
                                                                           String plantId,
                                                                           String departmentCode,
                                                                           String departmentId);
}