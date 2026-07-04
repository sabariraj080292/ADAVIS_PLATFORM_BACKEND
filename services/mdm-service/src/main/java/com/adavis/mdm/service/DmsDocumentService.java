package com.adavis.mdm.service;

import com.adavis.common.exception.BusinessException;
import com.adavis.common.exception.ResourceNotFoundException;
import com.adavis.mdm.model.entity.DmsDocument;
import com.adavis.mdm.repository.DmsDocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class DmsDocumentService {

    private final DmsDocumentRepository dmsDocumentRepository;
    private final DmsStorageService dmsStorageService;
    private final AuditEventPublisher auditEventPublisher;

    @Value("${mdm.dms.download-url-ttl-minutes:15}")
    private long downloadUrlTtlMinutes;

    public DmsDocument upload(MultipartFile file, String tenantId, String plantId, String uploadedBy) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("File is required", "FILE_REQUIRED");
        }
        if (!StringUtils.hasText(tenantId)) {
            throw new BusinessException("tenantId is required", "TENANT_ID_REQUIRED");
        }
        if (!StringUtils.hasText(plantId)) {
            throw new BusinessException("plantId is required", "PLANT_ID_REQUIRED");
        }
        if (!StringUtils.hasText(uploadedBy)) {
            throw new BusinessException("uploadedBy is required", "UPLOADED_BY_REQUIRED");
        }

        String documentId = "DOC-DMS-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
        DmsStorageService.StoredObject stored = dmsStorageService.store(file, tenantId.trim(), plantId.trim(), documentId);

        DmsDocument document = DmsDocument.builder()
                .documentId(documentId)
                .tenantId(tenantId.trim())
                .plantId(plantId.trim())
                .fileName(file.getOriginalFilename())
                .mimeType(file.getContentType())
                .fileSizeBytes(file.getSize())
                .repositoryDetails(stored.getRepositoryDetails())
                .sha256Checksum(computeSha256(file))
                .uploadedBy(uploadedBy.trim())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        DmsDocument saved = dmsDocumentRepository.save(document);
        log.info("Stored DMS document {} for tenant {}", saved.getDocumentId(), saved.getTenantId());
        auditEventPublisher.publish(
            uploadedBy.trim(),
            "DMS_DOCUMENT_UPLOADED",
            "DMS_DOCUMENT",
            saved.getDocumentId(),
            "SUCCESS",
            Map.of(
                "tenantId", saved.getTenantId(),
                "plantId", saved.getPlantId(),
                "fileName", saved.getFileName() == null ? "" : saved.getFileName()));
        return saved;
    }

    public Map<String, Object> createDownloadResponse(String documentId) {
        DmsDocument document = getByDocumentId(documentId);
        auditEventPublisher.publish(
            document.getUploadedBy() == null ? "SYSTEM" : document.getUploadedBy(),
            "DMS_DOCUMENT_DOWNLOAD_LINK_GENERATED",
            "DMS_DOCUMENT",
            document.getDocumentId(),
            "SUCCESS",
            Map.of(
                "tenantId", document.getTenantId(),
                "plantId", document.getPlantId(),
                "fileName", document.getFileName() == null ? "" : document.getFileName()));
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("documentId", document.getDocumentId());
        response.put("fileName", document.getFileName());
        response.put("mimeType", document.getMimeType());
        response.put("expiresInMinutes", downloadUrlTtlMinutes);
        response.put("downloadUrl", "/api/v1/dms/documents/" + document.getDocumentId() + "/content");
        response.put("repositoryDetails", document.getRepositoryDetails());
        return response;
    }

    public Resource loadContent(String documentId) {
        DmsDocument document = getByDocumentId(documentId);
        Object objectKey = document.getRepositoryDetails() == null ? null : document.getRepositoryDetails().get("objectKey");
        Object storageProvider = document.getRepositoryDetails() == null ? null : document.getRepositoryDetails().get("storageProvider");

        if (objectKey == null) {
            throw new BusinessException("Document repository details are incomplete", "DMS_REPOSITORY_DETAILS_INVALID");
        }

        return dmsStorageService.loadAsResource(objectKey.toString(), storageProvider == null ? null : storageProvider.toString());
    }

    public DmsDocument getByDocumentId(String documentId) {
        return dmsDocumentRepository.findByDocumentId(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + documentId));
    }

    private String computeSha256(MultipartFile file) {
        try (InputStream inputStream = file.getInputStream()) {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] buffer = new byte[8192];
            int read;
            while ((read = inputStream.read(buffer)) != -1) {
                digest.update(buffer, 0, read);
            }
            byte[] hash = digest.digest();
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (IOException | NoSuchAlgorithmException ex) {
            throw new BusinessException("Failed to compute document checksum", "DMS_CHECKSUM_FAILED");
        }
    }
}
