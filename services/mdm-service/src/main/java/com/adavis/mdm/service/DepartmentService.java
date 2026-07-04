package com.adavis.mdm.service;

import com.adavis.common.exception.BusinessException;
import com.adavis.common.exception.ResourceNotFoundException;
import com.adavis.mdm.model.entity.Department;
import com.adavis.mdm.repository.DepartmentRepository;
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
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final BusinessIdGeneratorService businessIdGeneratorService;
    private final AuditEventPublisher auditEventPublisher;

    @CacheEvict(value = "departments", allEntries = true)
    public Department createDepartment(Department department) {
        if (!StringUtils.hasText(department.getTenantId())) {
            throw new BusinessException("tenantId is required", "TENANT_ID_REQUIRED");
        }
        if (!StringUtils.hasText(department.getPlantId())) {
            throw new BusinessException("plantId is required", "PLANT_ID_REQUIRED");
        }
        if (!StringUtils.hasText(department.getDepartmentCode())) {
            throw new BusinessException("departmentCode is required", "DEPARTMENT_CODE_REQUIRED");
        }

        department.setDepartmentId(businessIdGeneratorService.nextId("mdm_departments", "departmentId", "DEP-", 4));
        if (departmentRepository.existsByDepartmentId(department.getDepartmentId())) {
            throw new BusinessException("Department ID already exists: " + department.getDepartmentId(), 
                    "DUPLICATE_DEPARTMENT");
        }
        if (departmentRepository.existsByTenantIdAndPlantIdAndDepartmentCode(
                department.getTenantId(),
                department.getPlantId(),
                department.getDepartmentCode())) {
            throw new BusinessException("departmentCode already exists: " + department.getDepartmentCode(),
                    "DUPLICATE_RESOURCE");
        }

        normalizeDepartmentFields(department);

        if (department.getParentDepartmentId() != null) {
            getDepartmentByDepartmentId(department.getParentDepartmentId());
        }

        if (!StringUtils.hasText(department.getPath())) {
            department.setPath(department.getParentDepartmentId() == null
                    ? department.getDepartmentId()
                    : department.getParentDepartmentId() + "/" + department.getDepartmentId());
        }

        department.setIsActive(true);
        department.setCreatedAt(Instant.now());
        department.setUpdatedAt(Instant.now());

        log.info("Creating department: {}", department.getDepartmentId());
        Department saved = departmentRepository.save(department);
        auditEventPublisher.publish(
            "SYSTEM",
            "DEPARTMENT_CREATED",
            "MDM_DEPARTMENT",
            saved.getDepartmentId(),
            "SUCCESS",
            metadataOf("departmentCode", saved.getDepartmentCode()));
        return saved;
    }

    @Cacheable(value = "departments", key = "#departmentId")
    public Department getDepartmentByDepartmentId(String departmentId) {
        return departmentRepository.findByDepartmentId(departmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + departmentId));
    }

    public List<Department> getAllDepartments() {
        return getAllDepartments(null);
    }

    public List<Department> getAllDepartments(Boolean isActive) {
        if (isActive == null) {
            return departmentRepository.findByIsActiveTrue();
        }
        return departmentRepository.findByIsActive(isActive);
    }

    public List<Department> getActiveDepartments() {
        return getAllDepartments(true);
    }

    public List<Department> getDepartmentsByParent(String parentDepartmentId) {
        return departmentRepository.findByParentDepartmentIdAndIsActiveTrue(parentDepartmentId);
    }

    @CacheEvict(value = "departments", key = "#departmentId")
    public Department updateDepartment(String departmentId, Department updatedDepartment) {
        Department existing = getDepartmentByDepartmentId(departmentId);

        String tenantId = StringUtils.hasText(updatedDepartment.getTenantId()) ? updatedDepartment.getTenantId() : existing.getTenantId();
        String plantId = StringUtils.hasText(updatedDepartment.getPlantId()) ? updatedDepartment.getPlantId() : existing.getPlantId();
        String departmentCode = StringUtils.hasText(updatedDepartment.getDepartmentCode()) ? updatedDepartment.getDepartmentCode() : existing.getDepartmentCode();
        if (!StringUtils.hasText(tenantId)) {
            throw new BusinessException("tenantId is required", "TENANT_ID_REQUIRED");
        }
        if (!StringUtils.hasText(plantId)) {
            throw new BusinessException("plantId is required", "PLANT_ID_REQUIRED");
        }
        if (!StringUtils.hasText(departmentCode)) {
            throw new BusinessException("departmentCode is required", "DEPARTMENT_CODE_REQUIRED");
        }

        if (departmentRepository.existsByTenantIdAndPlantIdAndDepartmentCodeAndDepartmentIdNot(
                tenantId,
                plantId,
                departmentCode,
                departmentId)) {
            throw new BusinessException("departmentCode already exists: " + departmentCode,
                    "DUPLICATE_RESOURCE");
        }

        existing.setTenantId(tenantId);
        existing.setPlantId(plantId);
        existing.setDepartmentCode(departmentCode);
        existing.setDepartmentName(StringUtils.hasText(updatedDepartment.getDepartmentName()) ? updatedDepartment.getDepartmentName() : updatedDepartment.getName());
        existing.setName(updatedDepartment.getName());
        if (!StringUtils.hasText(existing.getName())) {
            existing.setName(existing.getDepartmentName());
        }
        if (updatedDepartment.getDescription() != null) {
            existing.setDescription(updatedDepartment.getDescription());
        }
        if (updatedDepartment.getParentDepartmentId() != null) {
            existing.setParentDepartmentId(updatedDepartment.getParentDepartmentId());
        }
        if (StringUtils.hasText(updatedDepartment.getPath())) {
            existing.setPath(updatedDepartment.getPath());
        }
        if (updatedDepartment.getIsActive() != null) {
            existing.setIsActive(updatedDepartment.getIsActive());
        }
        existing.setUpdatedAt(Instant.now());

        log.info("Updating department: {}", departmentId);
        Department saved = departmentRepository.save(existing);
        auditEventPublisher.publish(
                "SYSTEM",
                "DEPARTMENT_UPDATED",
                "MDM_DEPARTMENT",
                saved.getDepartmentId(),
                "SUCCESS",
                metadataOf("departmentCode", saved.getDepartmentCode()));
        return saved;
    }

    @CacheEvict(value = "departments", key = "#departmentId")
    public void deleteDepartment(String departmentId) {
        Department department = getDepartmentByDepartmentId(departmentId);
        
        List<Department> children = departmentRepository.findByParentDepartmentId(departmentId);
        if (!children.isEmpty()) {
            throw new BusinessException("Cannot delete department with child departments", 
                    "DEPARTMENT_HAS_CHILDREN");
        }

        department.setIsActive(false);
        department.setUpdatedAt(Instant.now());
        departmentRepository.save(department);
        auditEventPublisher.publish("SYSTEM", "DEPARTMENT_DELETED", "MDM_DEPARTMENT", department.getDepartmentId(), "SUCCESS", Map.of());
        log.info("Deleted department: {}", departmentId);
    }

    @CacheEvict(value = "departments", key = "#departmentId")
    public Department reactivateDepartment(String departmentId) {
        Department department = getDepartmentByDepartmentId(departmentId);
        department.setIsActive(true);
        department.setUpdatedAt(Instant.now());
        Department saved = departmentRepository.save(department);
        auditEventPublisher.publish("SYSTEM", "DEPARTMENT_REACTIVATED", "MDM_DEPARTMENT", saved.getDepartmentId(), "SUCCESS", Map.of());
        return saved;
    }

    private void normalizeDepartmentFields(Department department) {
        if (!StringUtils.hasText(department.getDepartmentName()) && StringUtils.hasText(department.getName())) {
            department.setDepartmentName(department.getName());
        }
        if (!StringUtils.hasText(department.getName()) && StringUtils.hasText(department.getDepartmentName())) {
            department.setName(department.getDepartmentName());
        }
    }

    private Map<String, Object> metadataOf(String key, String value) {
        if (!StringUtils.hasText(value)) {
            return Map.of();
        }
        return Map.of(key, value);
    }
}