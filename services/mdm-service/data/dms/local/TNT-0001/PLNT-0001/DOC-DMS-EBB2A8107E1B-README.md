# Adavis Platform

This repository is aligned to the Phase 1 public API contract defined in [reference/Adavis Platform - Phase 1 Implementation.md](reference/Adavis%20Platform%20-%20Phase%201%20Implementation.md).

## Canonical Public Endpoints

### Authentication

| Method | Endpoint |
|---|---|
| POST | `/api/v1/auth/login-initiate` |
| POST | `/api/v1/auth/authenticate` |
| POST | `/api/v1/auth/session-initialize` |
| POST | `/api/v1/auth/logout` |

### Tenant and License Governance

Note: license is intentionally kept singular in implementation.

| Method | Endpoint |
|---|---|
| POST | `/api/v1/mdm/tenants` |
| GET | `/api/v1/mdm/tenants` |
| GET | `/api/v1/mdm/tenants/{tenantId}` |
| PUT | `/api/v1/mdm/tenants/{tenantId}` |
| DELETE | `/api/v1/mdm/tenants/{tenantId}` |
| POST | `/api/v1/mdm/license/tenant` |
| GET | `/api/v1/mdm/license/tenant/{tenantId}` |
| PUT | `/api/v1/mdm/license/{licenseId}/upgrade` |
| GET | `/api/v1/mdm/license/tenant/{tenantId}/history` |

### Plant Topology

| Method | Endpoint |
|---|---|
| POST | `/api/v1/mdm/plants` |
| GET | `/api/v1/mdm/plants` |
| GET | `/api/v1/mdm/plants/{plantId}` |
| PUT | `/api/v1/mdm/plants/{plantId}` |
| DELETE | `/api/v1/mdm/plants/{plantId}` |
| POST | `/api/v1/mdm/blocks` |
| GET | `/api/v1/mdm/blocks` |
| PUT | `/api/v1/mdm/blocks/{blockId}` |
| DELETE | `/api/v1/mdm/blocks/{blockId}` |
| POST | `/api/v1/mdm/areas` |
| GET | `/api/v1/mdm/areas` |
| PUT | `/api/v1/mdm/areas/{areaId}` |
| DELETE | `/api/v1/mdm/areas/{areaId}` |
| POST | `/api/v1/mdm/rooms` |
| GET | `/api/v1/mdm/rooms` |
| PUT | `/api/v1/mdm/rooms/{roomId}` |
| DELETE | `/api/v1/mdm/rooms/{roomId}` |

### Departments

| Method | Endpoint |
|---|---|
| POST | `/api/v1/mdm/departments` |
| GET | `/api/v1/mdm/departments` |
| GET | `/api/v1/mdm/departments/tree` |
| PUT | `/api/v1/mdm/departments/{departmentId}` |
| DELETE | `/api/v1/mdm/departments/{departmentId}` |

### Users, Groups, Roles, Permissions

| Method | Endpoint |
|---|---|
| POST | `/api/v1/mdm/users/onboard` |
| GET | `/api/v1/mdm/users` |
| GET | `/api/v1/mdm/users/{userId}` |
| PUT | `/api/v1/mdm/users/{userId}` |
| PATCH | `/api/v1/mdm/users/{userId}/lifecycle` |
| POST | `/api/v1/mdm/users/{userId}/password-reset` |
| DELETE | `/api/v1/mdm/users/{userId}` |
| POST | `/api/v1/mdm/user-groups` |
| GET | `/api/v1/mdm/user-groups` |
| GET | `/api/v1/mdm/user-groups/{groupId}` |
| PUT | `/api/v1/mdm/user-groups/{groupId}` |
| DELETE | `/api/v1/mdm/user-groups/{groupId}` |
| POST | `/api/v1/mdm/roles` |
| GET | `/api/v1/mdm/roles` |
| DELETE | `/api/v1/mdm/roles/{roleId}` |
| GET | `/api/v1/mdm/permissions/matrix-tree` |
| POST | `/api/v1/mdm/roles/{roleId}/permissions` |
| GET | `/api/v1/mdm/roles/{roleId}/permissions` |

### Assignments

| Method | Endpoint |
|---|---|
| POST | `/api/v1/mdm/assignments/grant` |
| POST | `/api/v1/mdm/assignments/exclude` |
| POST | `/api/v1/mdm/assignments/iiot/grant` |
| POST | `/api/v1/mdm/assignments/iiot/exclude` |
| GET | `/api/v1/mdm/assignments` |
| DELETE | `/api/v1/mdm/assignments/{assignmentId}` |

### IIOT Master Configuration

| Method | Endpoint |
|---|---|
| POST | `/api/v1/iiot/assets` |
| GET | `/api/v1/iiot/assets` |
| GET | `/api/v1/iiot/assets/{assetId}` |
| PUT | `/api/v1/iiot/assets/{assetId}` |
| DELETE | `/api/v1/iiot/assets/{assetId}` |
| POST | `/api/v1/iiot/asset-tags` |
| GET | `/api/v1/iiot/asset-tags` |
| GET | `/api/v1/iiot/asset-tags/{tagId}` |
| PUT | `/api/v1/iiot/asset-tags/{tagId}` |
| DELETE | `/api/v1/iiot/asset-tags/{tagId}` |
| POST | `/api/v1/iiot/tag-thresholds` |
| GET | `/api/v1/iiot/tag-thresholds` |
| GET | `/api/v1/iiot/tag-thresholds/{thresholdId}` |
| PUT | `/api/v1/iiot/tag-thresholds/{thresholdId}` |
| DELETE | `/api/v1/iiot/tag-thresholds/{thresholdId}` |

### DMS and Audit

| Method | Endpoint |
|---|---|
| POST | `/api/v1/dms/documents/upload` |
| GET | `/api/v1/dms/documents/{documentId}/download` |
| GET | `/api/v1/audit/trails` |
| GET | `/api/v1/audit/login-history` |

## Validation

The current main Postman collection validates the canonical public surface only.