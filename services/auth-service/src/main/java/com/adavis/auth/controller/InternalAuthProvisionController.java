package com.adavis.auth.controller;

import com.adavis.auth.dto.request.UserProvisionRequest;
import com.adavis.auth.dto.request.UserStatusUpdateRequest;
import com.adavis.auth.service.AuthenticationService;
import com.adavis.common.dto.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/internal/v1/auth/users")
@RequiredArgsConstructor
public class InternalAuthProvisionController {

    private final AuthenticationService authService;

    @PostMapping("/provision")
    public ResponseEntity<ApiResponse<Void>> provisionUser(@Valid @RequestBody UserProvisionRequest request) {
        authService.provisionUserWithInitialPassword(
                request.getUserId(), request.getUsername(), request.getEmail(), request.getInitialPassword());
        return ResponseEntity.ok(ApiResponse.successMessage("User provisioned with initial password"));
    }

    @PostMapping("/status")
    public ResponseEntity<ApiResponse<Void>> updateUserStatus(@Valid @RequestBody UserStatusUpdateRequest request) {
        authService.updateUserStatus(request.getUserId(), request.getStatus(), request.getIsLocked());
        return ResponseEntity.ok(ApiResponse.successMessage("User status updated"));
    }
}