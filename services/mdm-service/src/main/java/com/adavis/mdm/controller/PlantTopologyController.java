package com.adavis.mdm.controller;

import com.adavis.common.dto.ApiResponse;
import com.adavis.mdm.security.InternalRequestValidator;
import com.adavis.mdm.service.PlantTopologyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/mdm")
@RequiredArgsConstructor
public class PlantTopologyController {

    private static final String INTERNAL_AUTH_HEADER = "X-Internal-Auth";

    private final PlantTopologyService plantTopologyService;
    private final InternalRequestValidator internalRequestValidator;

    @PostMapping("/plants")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createPlant(
            @RequestHeader(value = INTERNAL_AUTH_HEADER, required = false) String internalAuth,
            @RequestBody Map<String, Object> request) {
        internalRequestValidator.validateInternalGatewayRequest(internalAuth);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Plant created successfully", plantTopologyService.createPlant(request)));
    }

    @GetMapping("/plants")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listPlants(
            @RequestParam(required = false) Boolean isActive) {
        return ResponseEntity.ok(ApiResponse.success(plantTopologyService.listPlants(isActive)));
    }

    @GetMapping("/plants/{plantId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPlant(@PathVariable String plantId) {
        return ResponseEntity.ok(ApiResponse.success(plantTopologyService.getPlant(plantId)));
    }

    @PutMapping("/plants/{plantId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updatePlant(
            @PathVariable String plantId,
            @RequestHeader(value = INTERNAL_AUTH_HEADER, required = false) String internalAuth,
            @RequestBody Map<String, Object> request) {
        internalRequestValidator.validateInternalGatewayRequest(internalAuth);
        return ResponseEntity.ok(ApiResponse.success("Plant updated successfully", plantTopologyService.updatePlant(plantId, request)));
    }

    @DeleteMapping("/plants/{plantId}")
    public ResponseEntity<ApiResponse<Void>> deletePlant(
            @PathVariable String plantId,
            @RequestHeader(value = INTERNAL_AUTH_HEADER, required = false) String internalAuth) {
        internalRequestValidator.validateInternalGatewayRequest(internalAuth);
        plantTopologyService.deletePlant(plantId);
        return ResponseEntity.ok(ApiResponse.successMessage("Plant deleted successfully"));
    }

    @PostMapping("/plants/{plantId}/deactivate")
    public ResponseEntity<ApiResponse<Void>> deactivatePlant(
            @PathVariable String plantId,
            @RequestHeader(value = INTERNAL_AUTH_HEADER, required = false) String internalAuth) {
        internalRequestValidator.validateInternalGatewayRequest(internalAuth);
        plantTopologyService.deletePlant(plantId);
        return ResponseEntity.ok(ApiResponse.successMessage("Plant deactivated successfully"));
    }

    @PostMapping("/plants/{plantId}/activate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> reactivatePlant(
            @PathVariable String plantId,
            @RequestHeader(value = INTERNAL_AUTH_HEADER, required = false) String internalAuth) {
        internalRequestValidator.validateInternalGatewayRequest(internalAuth);
        return ResponseEntity.ok(ApiResponse.success("Plant reactivated successfully", plantTopologyService.reactivatePlant(plantId)));
    }

    @PostMapping("/blocks")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createBlock(
            @RequestHeader(value = INTERNAL_AUTH_HEADER, required = false) String internalAuth,
            @RequestBody Map<String, Object> request) {
        internalRequestValidator.validateInternalGatewayRequest(internalAuth);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Block created successfully", plantTopologyService.createBlock(request)));
    }

    @GetMapping("/blocks")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listBlocks(
            @RequestParam(required = false) Boolean isActive) {
        return ResponseEntity.ok(ApiResponse.success(plantTopologyService.listBlocks(isActive)));
    }

    @PutMapping("/blocks/{blockId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateBlock(
            @PathVariable String blockId,
            @RequestHeader(value = INTERNAL_AUTH_HEADER, required = false) String internalAuth,
            @RequestBody Map<String, Object> request) {
        internalRequestValidator.validateInternalGatewayRequest(internalAuth);
        return ResponseEntity.ok(ApiResponse.success("Block updated successfully", plantTopologyService.updateBlock(blockId, request)));
    }

    @DeleteMapping("/blocks/{blockId}")
    public ResponseEntity<ApiResponse<Void>> deleteBlock(
            @PathVariable String blockId,
            @RequestHeader(value = INTERNAL_AUTH_HEADER, required = false) String internalAuth) {
        internalRequestValidator.validateInternalGatewayRequest(internalAuth);
        plantTopologyService.deleteBlock(blockId);
        return ResponseEntity.ok(ApiResponse.successMessage("Block deleted successfully"));
    }

    @PostMapping("/blocks/{blockId}/deactivate")
    public ResponseEntity<ApiResponse<Void>> deactivateBlock(
            @PathVariable String blockId,
            @RequestHeader(value = INTERNAL_AUTH_HEADER, required = false) String internalAuth) {
        internalRequestValidator.validateInternalGatewayRequest(internalAuth);
        plantTopologyService.deleteBlock(blockId);
        return ResponseEntity.ok(ApiResponse.successMessage("Block deactivated successfully"));
    }

    @PostMapping("/blocks/{blockId}/activate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> reactivateBlock(
            @PathVariable String blockId,
            @RequestHeader(value = INTERNAL_AUTH_HEADER, required = false) String internalAuth) {
        internalRequestValidator.validateInternalGatewayRequest(internalAuth);
        return ResponseEntity.ok(ApiResponse.success("Block reactivated successfully", plantTopologyService.reactivateBlock(blockId)));
    }

    @PostMapping("/areas")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createArea(
            @RequestHeader(value = INTERNAL_AUTH_HEADER, required = false) String internalAuth,
            @RequestBody Map<String, Object> request) {
        internalRequestValidator.validateInternalGatewayRequest(internalAuth);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Area created successfully", plantTopologyService.createArea(request)));
    }

    @GetMapping("/areas")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listAreas(
            @RequestParam(required = false) Boolean isActive) {
        return ResponseEntity.ok(ApiResponse.success(plantTopologyService.listAreas(isActive)));
    }

    @PutMapping("/areas/{areaId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateArea(
            @PathVariable String areaId,
            @RequestHeader(value = INTERNAL_AUTH_HEADER, required = false) String internalAuth,
            @RequestBody Map<String, Object> request) {
        internalRequestValidator.validateInternalGatewayRequest(internalAuth);
        return ResponseEntity.ok(ApiResponse.success("Area updated successfully", plantTopologyService.updateArea(areaId, request)));
    }

    @DeleteMapping("/areas/{areaId}")
    public ResponseEntity<ApiResponse<Void>> deleteArea(
            @PathVariable String areaId,
            @RequestHeader(value = INTERNAL_AUTH_HEADER, required = false) String internalAuth) {
        internalRequestValidator.validateInternalGatewayRequest(internalAuth);
        plantTopologyService.deleteArea(areaId);
        return ResponseEntity.ok(ApiResponse.successMessage("Area deleted successfully"));
    }

    @PostMapping("/areas/{areaId}/deactivate")
    public ResponseEntity<ApiResponse<Void>> deactivateArea(
            @PathVariable String areaId,
            @RequestHeader(value = INTERNAL_AUTH_HEADER, required = false) String internalAuth) {
        internalRequestValidator.validateInternalGatewayRequest(internalAuth);
        plantTopologyService.deleteArea(areaId);
        return ResponseEntity.ok(ApiResponse.successMessage("Area deactivated successfully"));
    }

    @PostMapping("/areas/{areaId}/activate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> reactivateArea(
            @PathVariable String areaId,
            @RequestHeader(value = INTERNAL_AUTH_HEADER, required = false) String internalAuth) {
        internalRequestValidator.validateInternalGatewayRequest(internalAuth);
        return ResponseEntity.ok(ApiResponse.success("Area reactivated successfully", plantTopologyService.reactivateArea(areaId)));
    }

    @PostMapping("/rooms")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createRoom(
            @RequestHeader(value = INTERNAL_AUTH_HEADER, required = false) String internalAuth,
            @RequestBody Map<String, Object> request) {
        internalRequestValidator.validateInternalGatewayRequest(internalAuth);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Room created successfully", plantTopologyService.createRoom(request)));
    }

    @GetMapping("/rooms")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listRooms(
            @RequestParam(required = false) Boolean isActive) {
        return ResponseEntity.ok(ApiResponse.success(plantTopologyService.listRooms(isActive)));
    }

    @PutMapping("/rooms/{roomId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateRoom(
            @PathVariable String roomId,
            @RequestHeader(value = INTERNAL_AUTH_HEADER, required = false) String internalAuth,
            @RequestBody Map<String, Object> request) {
        internalRequestValidator.validateInternalGatewayRequest(internalAuth);
        return ResponseEntity.ok(ApiResponse.success("Room updated successfully", plantTopologyService.updateRoom(roomId, request)));
    }

    @DeleteMapping("/rooms/{roomId}")
    public ResponseEntity<ApiResponse<Void>> deleteRoom(
            @PathVariable String roomId,
            @RequestHeader(value = INTERNAL_AUTH_HEADER, required = false) String internalAuth) {
        internalRequestValidator.validateInternalGatewayRequest(internalAuth);
        plantTopologyService.deleteRoom(roomId);
        return ResponseEntity.ok(ApiResponse.successMessage("Room deleted successfully"));
    }

    @PostMapping("/rooms/{roomId}/deactivate")
    public ResponseEntity<ApiResponse<Void>> deactivateRoom(
            @PathVariable String roomId,
            @RequestHeader(value = INTERNAL_AUTH_HEADER, required = false) String internalAuth) {
        internalRequestValidator.validateInternalGatewayRequest(internalAuth);
        plantTopologyService.deleteRoom(roomId);
        return ResponseEntity.ok(ApiResponse.successMessage("Room deactivated successfully"));
    }

    @PostMapping("/rooms/{roomId}/activate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> reactivateRoom(
            @PathVariable String roomId,
            @RequestHeader(value = INTERNAL_AUTH_HEADER, required = false) String internalAuth) {
        internalRequestValidator.validateInternalGatewayRequest(internalAuth);
        return ResponseEntity.ok(ApiResponse.success("Room reactivated successfully", plantTopologyService.reactivateRoom(roomId)));
    }
}
