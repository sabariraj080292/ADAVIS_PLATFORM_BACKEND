package com.adavis.mdm.controller;

import com.adavis.common.dto.ApiResponse;
import com.adavis.mdm.service.MetadataCatalogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/mdm")
@RequiredArgsConstructor
public class MetadataCatalogController {

    private final MetadataCatalogService metadataCatalogService;

    @GetMapping("/modules")
    public ResponseEntity<ApiResponse<java.util.List<Map<String, Object>>>> getModules(
            @RequestParam(required = false) Boolean isActive) {
        return ResponseEntity.ok(ApiResponse.success(metadataCatalogService.getModules(isActive)));
    }

    @GetMapping("/screens")
    public ResponseEntity<ApiResponse<java.util.List<Map<String, Object>>>> getScreens(
            @RequestParam(required = false) String moduleCode,
            @RequestParam(required = false) Boolean isActive) {
        return ResponseEntity.ok(ApiResponse.success(metadataCatalogService.getScreens(moduleCode, isActive)));
    }

    @GetMapping("/features")
    public ResponseEntity<ApiResponse<java.util.List<Map<String, Object>>>> getFeatures(
            @RequestParam(required = false) String moduleCode,
            @RequestParam(required = false) String screenCode,
            @RequestParam(required = false) Boolean isActive) {
        return ResponseEntity.ok(ApiResponse.success(metadataCatalogService.getFeatures(moduleCode, screenCode, isActive)));
    }

    @GetMapping("/permissions/matrix-tree")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPermissionsMatrixTree(
            @RequestParam(required = false) Boolean isActive) {
        return ResponseEntity.ok(ApiResponse.success(metadataCatalogService.getPermissionMatrixTree(isActive)));
    }
}
