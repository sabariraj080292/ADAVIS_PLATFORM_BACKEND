package com.adavis.iiot.controller;

import com.adavis.common.dto.ApiResponse;
import com.adavis.iiot.service.IiotOperationsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/iiot")
@RequiredArgsConstructor
public class IiotOperationsController {

    private final IiotOperationsService iiotOperationsService;

    @PostMapping("/assets")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createAsset(@RequestBody Map<String, Object> request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Asset created", iiotOperationsService.createAsset(request)));
    }

    @GetMapping("/assets")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAssets() {
        return ResponseEntity.ok(ApiResponse.success(iiotOperationsService.getAssets()));
    }

    @GetMapping("/assets/{assetId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAsset(@PathVariable String assetId) {
        return ResponseEntity.ok(ApiResponse.success(iiotOperationsService.getAsset(assetId)));
    }

    @PutMapping("/assets/{assetId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateAsset(
            @PathVariable String assetId,
            @RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(ApiResponse.success("Asset updated", iiotOperationsService.updateAsset(assetId, request)));
    }

    @DeleteMapping("/assets/{assetId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> deleteAsset(@PathVariable String assetId) {
        return ResponseEntity.ok(ApiResponse.success("Asset deleted", iiotOperationsService.deleteAsset(assetId)));
    }

    @PostMapping("/assets/{assetId}/activate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> reactivateAsset(@PathVariable String assetId) {
        return ResponseEntity.ok(ApiResponse.success("Asset reactivated", iiotOperationsService.reactivateAsset(assetId)));
    }

    @PostMapping("/asset-tags")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createAssetTag(@RequestBody Map<String, Object> request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Asset tag created", iiotOperationsService.createAssetTag(request)));
    }

    @GetMapping("/asset-tags")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAssetTags() {
        return ResponseEntity.ok(ApiResponse.success(iiotOperationsService.getAssetTags()));
    }

    @GetMapping("/asset-tags/{tagId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAssetTag(@PathVariable String tagId) {
        return ResponseEntity.ok(ApiResponse.success(iiotOperationsService.getAssetTag(tagId)));
    }

    @PutMapping("/asset-tags/{tagId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateAssetTag(
            @PathVariable String tagId,
            @RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(ApiResponse.success("Asset tag updated", iiotOperationsService.updateAssetTag(tagId, request)));
    }

    @DeleteMapping("/asset-tags/{tagId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> deleteAssetTag(@PathVariable String tagId) {
        return ResponseEntity.ok(ApiResponse.success("Asset tag deleted", iiotOperationsService.deleteAssetTag(tagId)));
    }

    @PostMapping("/asset-tags/{tagId}/activate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> reactivateAssetTag(@PathVariable String tagId) {
        return ResponseEntity.ok(ApiResponse.success("Asset tag reactivated", iiotOperationsService.reactivateAssetTag(tagId)));
    }

    @PostMapping("/tag-thresholds")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createTagThreshold(@RequestBody Map<String, Object> request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tag threshold created", iiotOperationsService.createTagThreshold(request)));
    }

    @GetMapping("/tag-thresholds")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getTagThresholds() {
        return ResponseEntity.ok(ApiResponse.success(iiotOperationsService.getTagThresholds()));
    }

    @GetMapping("/tag-thresholds/{thresholdId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTagThreshold(@PathVariable String thresholdId) {
        return ResponseEntity.ok(ApiResponse.success(iiotOperationsService.getTagThreshold(thresholdId)));
    }

    @PutMapping("/tag-thresholds/{thresholdId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateTagThreshold(
            @PathVariable String thresholdId,
            @RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(ApiResponse.success("Tag threshold updated", iiotOperationsService.updateTagThreshold(thresholdId, request)));
    }

    @DeleteMapping("/tag-thresholds/{thresholdId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> deleteTagThreshold(@PathVariable String thresholdId) {
        return ResponseEntity.ok(ApiResponse.success("Tag threshold deleted", iiotOperationsService.deleteTagThreshold(thresholdId)));
    }

    @PostMapping("/tag-thresholds/{thresholdId}/activate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> reactivateTagThreshold(@PathVariable String thresholdId) {
        return ResponseEntity.ok(ApiResponse.success("Tag threshold reactivated", iiotOperationsService.reactivateTagThreshold(thresholdId)));
    }
}