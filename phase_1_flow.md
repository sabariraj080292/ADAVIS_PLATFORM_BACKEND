# Adavis Platform Reference Guide (Sequential End-to-End Flow)

This guide describes the intended working sequence from local setup to endpoint validation, based on current implementation.

## 1) Environment and Service Boot

1. Validate local prerequisites (Java, Maven, Docker, ports).
2. Seed Mongo baseline data.
3. Start infra and Spring services.

Recommended command sequence:

```powershell
./scripts/check-environment.ps1
./scripts/seed-data.ps1
./scripts/setup-dev.ps1
```

Optional full rebuild:

```powershell
./scripts/build-all.ps1
```

## 2) Initial Security and Identity Context

1. super_admin credential is available from seeded baseline.
2. Authenticate via login-initiate then authenticate.
3. Identifier standard: use userId as primary identifier (email as secondary fallback).
3. API must return:
	- access token
	- refresh token
	- token metadata (expiry)
	- base user context
4. Session/logout should be auditable and cleanly invalidated.
5. Immediately after authenticate, call login-context API to fetch runtime authorization context.

Authentication endpoints:

- POST /api/v1/auth/login-initiate
- POST /api/v1/auth/authenticate
- POST /api/v1/auth/logout

## 3) Tenant and License Activation Sequence

1. Create tenant.
2. Obtain encrypted license token from Adavis licensing flow.
3. Activate (or upgrade) tenant license.
4. Verify active license and history.

Required order:

1. POST /api/v1/mdm/tenants
2. POST /api/v1/mdm/license/tenant
3. GET /api/v1/mdm/license/tenant/{tenantId}
4. GET /api/v1/mdm/license/tenant/{tenantId}/history

Notes:

- License is singular in current contract under /api/v1/mdm/license.
- User onboarding depends on license seat/module validation.

## 4) Admin Authorization Model Setup

After tenant + license are ready:

1. Create IT admin role and assign required permissions.
2. Create IT admin group and map role.
3. Ensure IT admin user is mapped through assignments.

Core endpoints:

- POST /api/v1/mdm/roles
- POST /api/v1/mdm/roles/{roleId}/permissions
- POST /api/v1/mdm/user-groups
- POST /api/v1/mdm/assignments/grant

Recommended role intent:

- IT_ADMIN: MDM + IIOT master configuration access.
- IIOT_OPERATOR: IIOT screens only, no MDM master administration.

## 5) Master Data Initialization (MDM)

Create in this order to avoid dependency gaps:

1. Plant
2. Block
3. Area
4. Room
5. Department

Then users and groups:

6. User onboarding
7. User lifecycle updates
8. Password reset

Endpoints:

- POST /api/v1/mdm/plants
- POST /api/v1/mdm/blocks
- POST /api/v1/mdm/areas
- POST /api/v1/mdm/rooms
- POST /api/v1/mdm/departments
- POST /api/v1/mdm/users/onboard
- PATCH /api/v1/mdm/users/{userId}/lifecycle
- POST /api/v1/mdm/users/{userId}/password-reset

Compliance expectations:

- Password reset should be traceable in password history.
- Lifecycle and password flows should be IT-admin-governed.
- Physical/supporting document references should be captured where required.

## 6) IIOT Master Configuration Flow

Initialize IIOT entities in this order:

1. Asset
2. Asset tag
3. Tag threshold

Endpoints:

- POST /api/v1/iiot/assets
- POST /api/v1/iiot/asset-tags
- POST /api/v1/iiot/tag-thresholds

Then validate CRUD coverage for each entity.

## 7) Permissions and User Context at Login

During authentication response handling:

1. Resolve user status and tenant context.
2. Resolve role/group-driven module and screen permissions.
3. Return app-usable user context.
4. If user belongs to multiple plants, client should support plant selection.

Recommended API sequence:

1. POST /api/v1/auth/login-initiate
2. POST /api/v1/auth/authenticate
3. GET /api/v1/mdm/users/{userId}/login-context

login-context response should be treated as the source of truth for:

1. groups
2. roles
3. rolePermissions
4. permissionMatrix
5. assignedPlants and selectedPlantId

Current implementation check:

1. Auth response currently returns token + base identity but does not include plant list/selected plant context.
2. Plant selection data must be resolved from MDM assignment context after login.
3. Recommended integration: fetch user assignment context from MDM and render plant chooser when multiple plants are assigned.

## 8) DMS and Audit Flow

1. Upload document with required metadata.
2. Use documentId for download URL retrieval.
3. Verify audit trails and login history.

Endpoints:

- POST /api/v1/dms/documents/upload
- GET /api/v1/dms/documents/{documentId}/download
- GET /api/v1/audit/trails
- GET /api/v1/audit/login-history

## 9) API Response and Schema Rules

1. Prefer business IDs (tenantId, userId, roleId, etc.) as primary references.
2. Avoid exposing internal persistence IDs when business IDs exist.
3. Align payload schema with sample collections.
4. Keep canonical contract only; avoid legacy alias routes.
5. Soft-delete and reactivate flows are excluded from the runnable validation collection for current reference runs.

## 9.1) Sample Collection List (Schema Reference)

Use these files in sample_collections as the canonical schema naming reference while shaping payloads and responses:

1. mdm_tenants.js: tenantId, companyCode, companyName, domain, status, isDeleted
2. mdm_licenses.js: licenseId, tenantId, modules, maxUsers, status, encryptedLicenseToken
3. mdm_licence_history.js: tenantId, actionType, previous/new snapshot fields
4. mdm_plants.js: plantId, tenantId, plantCode, plantName, type, address, timezone, isActive
5. mdm_blocks.js: tenantId, plantId, blockCode, blockName, displayOrder, isActive
6. mdm_areas.js: tenantId, plantId, blockId, areaCode, areaName, displayOrder, isActive
7. mdm_rooms.js: tenantId, plantId, areaId, roomCode, roomName, classification, isActive
8. mdm_departments.js: departmentId, tenantId, plantId, departmentCode, departmentName, level, path, isActive
9. mdm_user_profiles.js: userId, userTrackId, tenantId, firstName, lastName, email, lifecycleStatus, empId
10. mdm_user_groups.js: groupId, tenantId, groupCode, groupName, roleIds, isActive
11. mdm_roles.js: roleId, tenantId, roleCode, roleName, isActive
12. mdm_role_permissions.js: roleId + module/screen action matrix
13. mdm_user_context_assignments.js: assignmentId, tenantId, userId, plantId, departmentId, groupId
14. mdm_user_lifecycle_requests.js: requestId, targetUserId, requestType, lifecycleAction, requestStatus, supportingDocuments
15. mdm_password_policies.js: password policy controls and history rules
16. mdm_user_auth_credentials.js: password hash and auth credential metadata
17. auth_password_tokens.js: reset/temporary token flows
18. auth_password_history.js: password rotation/reuse checks
19. mdm_user_sessions.js: login sessions and invalidation metadata
20. login_history.js: login audit records
21. iiot_assets.js: assetId, tenantId, plant/block/area/room context, assetCode, assetName, assetType
22. iiot_asset_tags.js: tagId, assetId, assetCode, tagCode, tagName, dataType, unitOfMeasure
23. iiot_tag_thresholds.js: thresholdId, tagId, tagCode, condition, warningThreshold, criticalThreshold, targetValue
24. iiot_asset_states.js: live status snapshot state
25. iiot_telemetry.js: telemetry time-series records
26. dms_documents.js: documentId, tenantId, plantId, file metadata, checksum, repositoryDetails
27. mdm_audit_trails.js: action-level audit events
28. modules.js / screens.js / features.js: permission catalog tree

## 10) Token and Password Handling Guidance

1. Login/auth endpoints currently accept password in request payload over secured transport.
2. Enforce TLS in non-local environments.
3. Never store plaintext password; persist only hashes.
4. Keep refresh-token rotation/session invalidation auditable.

## 11) Validation Checklist (Sequential)

Use this order for stable E2E validation:

1. Auth success (login-initiate, authenticate, logout)
2. Tenant create + license activate/upgrade
3. Role/permission/group setup
4. MDM hierarchy CRUD (plant/block/area/room/department)
5. User onboarding + reset (lifecycle/reactivate is optional and excluded in default runnable collection)
6. IIOT CRUD chain (asset/tag/threshold)
7. DMS upload/download
8. Audit trail verification

## 12) Data Reset, Reseed, and Re-run

For deterministic reruns:

```powershell
./scripts/stop-all.ps1
./scripts/seed-data.ps1
./scripts/setup-dev.ps1 -ForceRestart
npx --yes newman run postman/Adavis-Platform.postman_collection.json --reporters cli,json --reporter-json-export logs/newman-main.json
```

If seed fails due to existing unique conflicts, run full reset seed (without -NoReset).

---

Use this document as the operational reference for implementation, endpoint sequencing, and validation order.



