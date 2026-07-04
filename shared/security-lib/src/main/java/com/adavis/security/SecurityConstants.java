package com.adavis.security;

public final class SecurityConstants {

    private SecurityConstants() {}

    public static final String AUTHORIZATION_HEADER = "Authorization";
    public static final String BEARER_PREFIX = "Bearer ";
    public static final String X_USER_ID = "X-User-Id";
    public static final String X_USERNAME = "X-Username";
    public static final String X_TENANT_ID = "X-Tenant-Id";

    public static final long TOKEN_EXPIRATION_MS = 3600000;  // 1 hour
    public static final long REFRESH_TOKEN_EXPIRATION_MS = 86400000;  // 24 hours
    public static final int BCRYPT_STRENGTH = 10;
}