package com.adavis.mdm.model.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "dms_documents")
public class DmsDocument {

    @Id
    private String id;

    @Indexed(unique = true)
    private String documentId;

    private String tenantId;
    private String plantId;

    private String fileName;
    private String mimeType;
    private Long fileSizeBytes;

    private Map<String, Object> repositoryDetails;
    private String sha256Checksum;
    private String uploadedBy;

    private Instant createdAt;
    private Instant updatedAt;
}
