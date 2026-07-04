package com.adavis.license.repository;

import com.adavis.license.model.entity.License;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface LicenseRepository extends MongoRepository<License, String> {

    Optional<License> findByLicenseKeyAndIsDeletedFalse(String licenseKey);

    Optional<License> findByTenantIdAndIsDeletedFalse(String tenantId);

    Optional<License> findByTenantIdAndStatusAndIsDeletedFalse(String tenantId, String status);

    List<License> findByStatusAndIsDeletedFalse(String status);

    List<License> findByExpiryDateBeforeAndStatusNotAndIsDeletedFalse(Instant expiryDate, String status);

    boolean existsByModulesContainingAndStatusAndIsDeletedFalse(String module, String status);

    Optional<License> findFirstByStatusOrderByCreatedAtDesc(String status);
}