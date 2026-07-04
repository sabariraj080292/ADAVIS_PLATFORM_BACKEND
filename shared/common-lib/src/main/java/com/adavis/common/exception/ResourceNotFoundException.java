package com.adavis.common.exception;

public class ResourceNotFoundException extends RuntimeException {

    private final String resourceType;
    private final String resourceId;

    // Constructor with just message
    public ResourceNotFoundException(String message) {
        super(message);
        this.resourceType = null;
        this.resourceId = null;
    }

    // Constructor with resource type and id
    public ResourceNotFoundException(String resourceType, String resourceId) {
        super(String.format("%s not found with id: %s", resourceType, resourceId));
        this.resourceType = resourceType;
        this.resourceId = resourceId;
    }

    // Constructor with resource type and field name
    public ResourceNotFoundException(String resourceType, String fieldName, Object fieldValue) {
        super(String.format("%s not found with %s: %s", resourceType, fieldName, fieldValue));
        this.resourceType = resourceType;
        this.resourceId = String.valueOf(fieldValue);
    }

    public String getResourceType() {
        return resourceType;
    }

    public String getResourceId() {
        return resourceId;
    }
}