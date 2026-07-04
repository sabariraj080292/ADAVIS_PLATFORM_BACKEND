package com.adavis.mdm.controller;

import com.adavis.common.dto.ApiResponse;
import com.adavis.mdm.model.entity.DmsDocument;
import com.adavis.mdm.security.InternalRequestValidator;
import com.adavis.mdm.service.DmsDocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/dms/documents")
@RequiredArgsConstructor
public class DmsDocumentController {

    private static final String INTERNAL_AUTH_HEADER = "X-Internal-Auth";

    private final DmsDocumentService dmsDocumentService;
    private final InternalRequestValidator internalRequestValidator;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<DmsDocument>> upload(
            @RequestHeader(value = INTERNAL_AUTH_HEADER, required = false) String internalAuth,
            @RequestParam("file") MultipartFile file,
            @RequestParam("tenantId") String tenantId,
            @RequestParam("plantId") String plantId,
            @RequestParam("uploadedBy") String uploadedBy) {
        internalRequestValidator.validateInternalGatewayRequest(internalAuth);
        DmsDocument created = dmsDocumentService.upload(file, tenantId, plantId, uploadedBy);
        return ResponseEntity.ok(ApiResponse.success("Document uploaded successfully", created));
    }

    @GetMapping("/{documentId}/download")
    public ResponseEntity<ApiResponse<Map<String, Object>>> download(@PathVariable String documentId) {
        return ResponseEntity.ok(ApiResponse.success(dmsDocumentService.createDownloadResponse(documentId)));
    }
}
