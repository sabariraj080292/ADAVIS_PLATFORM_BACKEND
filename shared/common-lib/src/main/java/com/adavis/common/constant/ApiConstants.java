package com.adavis.common.constant;

public final class ApiConstants {

    private ApiConstants() {}

    public static final String API_VERSION = "/api/v1";
    public static final String BASE_API_PATH = API_VERSION;

    public static final String HEADER_AUTHORIZATION = "Authorization";
    public static final String HEADER_BEARER_PREFIX = "Bearer ";
    public static final String HEADER_TENANT_ID = "X-Tenant-ID";
    public static final String HEADER_USER_ID = "X-User-ID";
    public static final String HEADER_CORRELATION_ID = "X-Correlation-ID";

    public static final String ERROR_VALIDATION = "VALIDATION_ERROR";
    public static final String ERROR_UNAUTHORIZED = "UNAUTHORIZED";
    public static final String ERROR_FORBIDDEN = "FORBIDDEN";
    public static final String ERROR_NOT_FOUND = "NOT_FOUND";
    public static final String ERROR_INTERNAL = "INTERNAL_ERROR";
    public static final String ERROR_BUSINESS = "BUSINESS_ERROR";

    public static final int DEFAULT_PAGE_SIZE = 20;
    public static final int MAX_PAGE_SIZE = 100;
}