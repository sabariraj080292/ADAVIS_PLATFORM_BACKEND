package com.adavis.auth.controller;

import com.adavis.auth.dto.request.PasswordPolicyVerifyRequest;
import com.adavis.auth.service.AuthenticationService;
import com.adavis.auth.service.PasswordPolicyService;
import com.adavis.auth.service.SessionService;
import com.adavis.common.dto.ApiResponse;
import com.adavis.dto.auth.request.*;
import com.adavis.dto.auth.response.AuthResponse;
import com.adavis.dto.auth.response.LoginInitiateResponse;
import com.adavis.dto.auth.response.SessionResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthenticationService authService;
    private final PasswordPolicyService passwordPolicyService;
    private final SessionService sessionService;

    // ============================================
    // LOGIN FLOW
    // ============================================

    /**
     * Step 1: Initiate login - Verify user exists and password is set
     */
    @PostMapping("/login-initiate")
    public ResponseEntity<ApiResponse<LoginInitiateResponse>> initiateLogin(
            @Valid @RequestBody LoginInitiateRequest request) {
        LoginInitiateResponse response = authService.initiateLogin(request.getIdentifier());
        return ResponseEntity.ok(ApiResponse.success("User verified", response));
    }

    /**
     * Step 2: Authenticate user with credentials
     */
    @PostMapping({"/authenticate", "/session-initialize"})
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {
        String deviceInfo = httpRequest.getHeader("User-Agent");
        String ipAddress = getClientIp(httpRequest);
        AuthResponse response = authService.login(
                request.getIdentifier(),
                request.getPassword(),
                deviceInfo,
                ipAddress
        );
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    /**
     * Refresh access token and rotate refresh token if the session is still active.
     */
    @PostMapping({"/refresh", "/token-refresh"})
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            @Valid @RequestBody RefreshTokenRequest request,
            HttpServletRequest httpRequest) {
        String deviceInfo = httpRequest.getHeader("User-Agent");
        String ipAddress = getClientIp(httpRequest);
        AuthResponse response = authService.refreshTokenWithRotation(
                request.getRefreshToken(),
                deviceInfo,
                ipAddress
        );
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", response));
    }

    /**
     * Return active sessions for the authenticated user.
     */
    @GetMapping("/sessions/active")
    public ResponseEntity<ApiResponse<List<SessionResponse>>> getActiveSessions(
            @RequestHeader("Authorization") String token) {
        String userId = authService.getCurrentUser(token).getUserId();
        List<SessionResponse> sessions = sessionService.getActiveSessions(userId);
        return ResponseEntity.ok(ApiResponse.success("Active sessions fetched successfully", sessions));
    }

    /**
     * Logout - invalidate session and tokens
     */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @RequestHeader(value = "Authorization", required = false) String token) {
        authService.logout(token);
        return ResponseEntity.ok(ApiResponse.successMessage("Logged out successfully"));
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}