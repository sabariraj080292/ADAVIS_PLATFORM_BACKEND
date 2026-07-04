package com.adavis.license.repository;

import com.adavis.license.model.entity.LicenseHistory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LicenseHistoryRepository extends MongoRepository<LicenseHistory, String> {

    List<LicenseHistory> findByTenantIdOrderByPerformedAtDesc(String tenantId);

    List<LicenseHistory> findByTenantIdAndAction(String tenantId, String action);
}