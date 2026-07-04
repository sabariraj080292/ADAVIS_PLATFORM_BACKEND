# API Endpoints (Current Implementation)

This document is generated from current controller mappings in `services/*/src/main/java/**/*Controller.java`.

## API Gateway

### FallbackController (`/fallback`)
- `GET /fallback/auth`
- `GET /fallback/mdm`
- `GET /fallback/default`

## Auth Service

### AuthenticationController (`/api/v1/auth`)
- `POST /api/v1/auth/login-initiate`
- `POST /api/v1/auth/authenticate`
- `POST /api/v1/auth/session-initialize`
- `POST /api/v1/auth/logout`

### InternalAuthProvisionController (`/internal/v1/auth/users`)
- `POST /internal/v1/auth/users/provision`

## Audit Service

### AuditLogController (`/api/v1/audit`)
- `GET /api/v1/audit/trails`
- `GET /api/v1/audit/login-history`

### InternalAuditIngestController (`/internal/v1/audit`)
- `POST /internal/v1/audit/logs`

## License Service

### LicenseController (`/api/v1/mdm/license`)
- `POST /api/v1/mdm/license/tenant`
- `GET /api/v1/mdm/license/tenant/{tenantId}`
- `PUT /api/v1/mdm/license/{licenseId}/upgrade`
- `GET /api/v1/mdm/license/tenant/{tenantId}/history`

### InternalLicenseController (`/internal/v1/mdm/license`)
- `POST /internal/v1/mdm/license/tenant/{tenantId}/validate`
- `PATCH /internal/v1/mdm/license/tenant/{tenantId}/user-count`
- `GET /internal/v1/mdm/license/tenant/{tenantId}/modules`
- `GET /internal/v1/mdm/license/tenant/{tenantId}/key`

## MDM Service

### TenantGovernanceController (`/api/v1/mdm`)
- `POST /api/v1/mdm/tenants`
- `GET /api/v1/mdm/tenants`
- `GET /api/v1/mdm/tenants/{tenantId}`
- `PUT /api/v1/mdm/tenants/{tenantId}`
- `DELETE /api/v1/mdm/tenants/{tenantId}`
- `POST /api/v1/mdm/tenants/{tenantId}/deactivate`
- `POST /api/v1/mdm/tenants/{tenantId}/activate`

### PlantTopologyController (`/api/v1/mdm`)
- `POST /api/v1/mdm/plants`
- `GET /api/v1/mdm/plants`
- `GET /api/v1/mdm/plants/{plantId}`
- `PUT /api/v1/mdm/plants/{plantId}`
- `DELETE /api/v1/mdm/plants/{plantId}`
- `POST /api/v1/mdm/plants/{plantId}/deactivate`
- `POST /api/v1/mdm/plants/{plantId}/activate`

- `POST /api/v1/mdm/blocks`
- `GET /api/v1/mdm/blocks`
- `PUT /api/v1/mdm/blocks/{blockId}`
- `DELETE /api/v1/mdm/blocks/{blockId}`
- `POST /api/v1/mdm/blocks/{blockId}/deactivate`
- `POST /api/v1/mdm/blocks/{blockId}/activate`

- `POST /api/v1/mdm/areas`
- `GET /api/v1/mdm/areas`
- `PUT /api/v1/mdm/areas/{areaId}`
- `DELETE /api/v1/mdm/areas/{areaId}`
- `POST /api/v1/mdm/areas/{areaId}/deactivate`
- `POST /api/v1/mdm/areas/{areaId}/activate`

- `POST /api/v1/mdm/rooms`
- `GET /api/v1/mdm/rooms`
- `PUT /api/v1/mdm/rooms/{roomId}`
- `DELETE /api/v1/mdm/rooms/{roomId}`
- `POST /api/v1/mdm/rooms/{roomId}/deactivate`
- `POST /api/v1/mdm/rooms/{roomId}/activate`

### DepartmentController (`/api/v1/mdm/departments`)
- `POST /api/v1/mdm/departments`
- `GET /api/v1/mdm/departments`
- `GET /api/v1/mdm/departments/tree`
- `PUT /api/v1/mdm/departments/{departmentId}`
- `DELETE /api/v1/mdm/departments/{departmentId}`
- `POST /api/v1/mdm/departments/{departmentId}/deactivate`
- `POST /api/v1/mdm/departments/{departmentId}/activate`

### UserGroupController (`/api/v1/mdm/user-groups`)
- `POST /api/v1/mdm/user-groups`
- `GET /api/v1/mdm/user-groups/{groupId}`
- `GET /api/v1/mdm/user-groups`
- `PUT /api/v1/mdm/user-groups/{groupId}`
- `DELETE /api/v1/mdm/user-groups/{groupId}`
- `POST /api/v1/mdm/user-groups/{groupId}/deactivate`
- `POST /api/v1/mdm/user-groups/{groupId}/activate`

### GroupMappingController (`/api/v1/mdm/user-groups`)
- `POST /api/v1/mdm/user-groups/{groupId}/roles`
- `GET /api/v1/mdm/user-groups/{groupId}/roles`
- `DELETE /api/v1/mdm/user-groups/{groupId}/roles/{roleId}`
- `POST /api/v1/mdm/user-groups/{groupId}/users`
- `GET /api/v1/mdm/user-groups/{groupId}/users`
- `DELETE /api/v1/mdm/user-groups/{groupId}/users/{userId}`

### RoleController (`/api/v1/mdm/roles`)
- `POST /api/v1/mdm/roles`
- `GET /api/v1/mdm/roles`
- `DELETE /api/v1/mdm/roles/{roleId}`
- `POST /api/v1/mdm/roles/{roleId}/deactivate`
- `POST /api/v1/mdm/roles/{roleId}/activate`
- `POST /api/v1/mdm/roles/{roleId}/permissions`
- `GET /api/v1/mdm/roles/{roleId}/permissions`

### AssignmentController (`/api/v1/mdm/assignments`)
- `POST /api/v1/mdm/assignments/grant`
- `POST /api/v1/mdm/assignments/exclude`
- `POST /api/v1/mdm/assignments/iiot/grant`
- `POST /api/v1/mdm/assignments/iiot/exclude`
- `GET /api/v1/mdm/assignments`
- `DELETE /api/v1/mdm/assignments/{assignmentId}`
- `POST /api/v1/mdm/assignments/{assignmentId}/activate`

### MetadataCatalogController (`/api/v1/mdm`)
- `GET /api/v1/mdm/modules`
- `GET /api/v1/mdm/screens`
- `GET /api/v1/mdm/features`
- `GET /api/v1/mdm/permissions/matrix-tree`

### DmsDocumentController (`/api/v1/dms/documents`)
- `POST /api/v1/dms/documents/upload` (multipart/form-data)
- `GET /api/v1/dms/documents/{documentId}/download`

### UserController (`/api/v1/mdm/users`)
- `POST /api/v1/mdm/users/onboard`
- `GET /api/v1/mdm/users/{userId}`
- `GET /api/v1/mdm/users/{userId}/login-context`
- `POST /api/v1/mdm/users/{userId}/select-plant`
- `GET /api/v1/mdm/users`
- `PUT /api/v1/mdm/users/{userId}`
- `DELETE /api/v1/mdm/users/{userId}`
- `PATCH /api/v1/mdm/users/{userId}/lifecycle`
- `POST /api/v1/mdm/users/{userId}/password-reset`
- `POST /api/v1/mdm/users/{userId}/deactivate`
- `POST /api/v1/mdm/users/{userId}/activate`
- `POST /api/v1/mdm/users/{userId}/block`
- `POST /api/v1/mdm/users/{userId}/unblock`

## IIOT Service

### IiotOperationsController (`/api/v1/iiot`)
- `POST /api/v1/iiot/assets`
- `GET /api/v1/iiot/assets`
- `GET /api/v1/iiot/assets/{assetId}`
- `PUT /api/v1/iiot/assets/{assetId}`
- `DELETE /api/v1/iiot/assets/{assetId}`
- `POST /api/v1/iiot/assets/{assetId}/activate`

- `POST /api/v1/iiot/asset-tags`
- `GET /api/v1/iiot/asset-tags`
- `GET /api/v1/iiot/asset-tags/{tagId}`
- `PUT /api/v1/iiot/asset-tags/{tagId}`
- `DELETE /api/v1/iiot/asset-tags/{tagId}`
- `POST /api/v1/iiot/asset-tags/{tagId}/activate`

- `POST /api/v1/iiot/tag-thresholds`
- `GET /api/v1/iiot/tag-thresholds`
- `GET /api/v1/iiot/tag-thresholds/{thresholdId}`
- `PUT /api/v1/iiot/tag-thresholds/{thresholdId}`
- `DELETE /api/v1/iiot/tag-thresholds/{thresholdId}`
- `POST /api/v1/iiot/tag-thresholds/{thresholdId}/activate`

## Notes
- `AuthenticationController` maps one handler to both `/authenticate` and `/session-initialize`.
- This list contains only routes defined directly by controller annotations.