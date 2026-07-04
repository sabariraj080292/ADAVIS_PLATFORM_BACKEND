package com.adavis.audit.controller;

import com.adavis.audit.model.dto.AuditEvent;
import com.adavis.audit.model.entity.AuditLog;
import com.adavis.audit.service.AuditLogService;
import com.adavis.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/internal/v1/audit")
@RequiredArgsConstructor
public class InternalAuditIngestController {

    private final AuditLogService auditLogService;

    @PostMapping("/logs")
    public ApiResponse<AuditLog> createAuditLog(@Valid @RequestBody AuditEvent event) {
        AuditLog auditLog = auditLogService.logEvent(event);
        return ApiResponse.success("Audit log created successfully", auditLog);
    }
}