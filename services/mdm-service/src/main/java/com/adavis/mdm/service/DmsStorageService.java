package com.adavis.mdm.service;

import com.adavis.common.exception.BusinessException;
import lombok.Builder;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@Service
public class DmsStorageService {

    @Value("${mdm.dms.storage.provider:LOCAL}")
    private String provider;

    @Value("${mdm.dms.storage.local.root-path:./data/dms/local}")
    private String localRootPath;

    @Value("${mdm.dms.storage.cloud.root-path:./data/dms/cloud}")
    private String cloudRootPath;

    @Value("${mdm.dms.storage.cloud.bucket-name:adavis-dms}")
    private String cloudBucketName;

    public StoredObject store(MultipartFile file, String tenantId, String plantId, String documentId) {
        String effectiveProvider = normalizedProvider();
        Path root = getRootPath(effectiveProvider);

        try {
            Files.createDirectories(root);
        } catch (IOException ex) {
            throw new BusinessException("Unable to initialize DMS storage path", "DMS_STORAGE_INIT_FAILED");
        }

        String originalFileName = safeFileName(file.getOriginalFilename());
        String objectKey = tenantId + "/" + plantId + "/" + documentId + "-" + originalFileName;
        Path fullPath = root.resolve(Paths.get(objectKey));

        try {
            Files.createDirectories(fullPath.getParent());
            Files.write(fullPath, file.getBytes(), StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
        } catch (IOException ex) {
            throw new BusinessException("Failed to store document", "DMS_STORE_FAILED");
        }

        Map<String, Object> repositoryDetails = new LinkedHashMap<>();
        repositoryDetails.put("storageProvider", effectiveProvider);
        repositoryDetails.put("bucketName", "CLOUD".equals(effectiveProvider) ? cloudBucketName : "LOCAL_FS");
        repositoryDetails.put("objectKey", objectKey.replace('\\', '/'));

        return StoredObject.builder()
                .provider(effectiveProvider)
                .objectKey(objectKey.replace('\\', '/'))
                .repositoryDetails(repositoryDetails)
                .build();
    }

    public Resource loadAsResource(String objectKey, String storageProvider) {
        String effectiveProvider = StringUtils.hasText(storageProvider) ? storageProvider.trim().toUpperCase() : normalizedProvider();
        Path fullPath = getRootPath(effectiveProvider).resolve(Paths.get(objectKey));

        try {
            Resource resource = new UrlResource(fullPath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new BusinessException("Document content not found", "DMS_CONTENT_NOT_FOUND");
            }
            return resource;
        } catch (MalformedURLException ex) {
            throw new BusinessException("Invalid document content path", "DMS_CONTENT_INVALID_PATH");
        }
    }

    private Path getRootPath(String effectiveProvider) {
        if ("CLOUD".equals(effectiveProvider)) {
            return Paths.get(cloudRootPath);
        }
        return Paths.get(localRootPath);
    }

    private String normalizedProvider() {
        return StringUtils.hasText(provider) ? provider.trim().toUpperCase() : "LOCAL";
    }

    private String safeFileName(String fileName) {
        String fallback = "document.bin";
        if (!StringUtils.hasText(fileName)) {
            return fallback;
        }
        String name = Paths.get(fileName).getFileName().toString().replace("..", "_");
        return name.isBlank() ? fallback : name;
    }

    @Data
    @Builder
    public static class StoredObject {
        private String provider;
        private String objectKey;
        private Map<String, Object> repositoryDetails;
    }
}
