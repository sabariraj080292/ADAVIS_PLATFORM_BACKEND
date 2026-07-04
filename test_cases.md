# Test Scenarios - UI-Equivalent End-to-End and API Availability Coverage

## 1. Objective

This test suite validates:

1. UI-equivalent business flows from login to tenant/license onboarding, MDM, IIOT, and audit.
2. API readiness for each UI screen/action.
3. Role-based behavior (SUPER_ADMIN, IT_ADMIN, other operational users).
4. Mandatory side effects: audit trails, login history, and session behavior.

## 2. Preconditions and Test Data

1. Services and gateway are up:
   1. auth-service, mdm-service, license-service, audit-service, iiot-service, api-gateway.
2. DB seeded with minimal baseline:
   1. SUPER_ADMIN profile/auth/credentials.
   2. Platform admin group + SUPER_ADMIN role mapping.
   3. Modules/screens/features catalog.
3. SUPER_ADMIN credentials available.
4. For onboarding tests, tenant and license are created/activated first (or expected negative response is asserted).

## 3. Test Execution Strategy

1. Phase A: API smoke and contract checks for all UI-used endpoints.
2. Phase B: UI-equivalent business workflows (happy path).
3. Phase C: Negative, security, and permission tests.
4. Phase D: Cross-cutting validations (audit, login history, session lifecycle, data consistency).

## 4. UI-Equivalent Scenarios

## 4.1 Authentication and Session

1. Login initiate by userId succeeds for active user.
2. Login initiate by email succeeds for active user.
3. Authentication succeeds with valid credentials and returns accessToken, refreshToken, userId.
4. Login context returns tenant, groups, roles, permissions, assigned plants.
5. If user has multiple assigned plants, UI shows plant dropdown and submits selected plant.
6. Logout invalidates active session.
7. Negative: invalid password returns auth failure.
8. Negative: blocked/inactive user cannot authenticate.
9. Verify login history entry created for successful login.

APIs:

1. POST /api/v1/auth/login-initiate
2. POST /api/v1/auth/authenticate
3. POST /api/v1/auth/session-initialize
4. POST /api/v1/auth/logout
5. GET /api/v1/mdm/users/{userId}/login-context
6. POST /api/v1/mdm/users/{userId}/select-plant
7. GET /api/v1/audit/login-history

## 4.2 Tenant and License Governance (SUPER_ADMIN)

1. SUPER_ADMIN creates tenant.
2. SUPER_ADMIN views tenant list/details.
3. SUPER_ADMIN updates tenant details.
4. SUPER_ADMIN activates/deactivates tenant.
5. SUPER_ADMIN applies initial tenant license.
6. SUPER_ADMIN verifies license details/history.
7. SUPER_ADMIN upgrades license and re-checks history.
8. Negative: onboarding user before license activation returns seat/module/license validation error.

APIs:

1. POST /api/v1/mdm/tenants
2. GET /api/v1/mdm/tenants
3. GET /api/v1/mdm/tenants/{tenantId}
4. PUT /api/v1/mdm/tenants/{tenantId}
5. POST /api/v1/mdm/tenants/{tenantId}/activate
6. POST /api/v1/mdm/tenants/{tenantId}/deactivate
7. POST /api/v1/mdm/license/tenant
8. GET /api/v1/mdm/license/tenant/{tenantId}
9. PUT /api/v1/mdm/license/{licenseId}/upgrade
10. GET /api/v1/mdm/license/tenant/{tenantId}/history

## 4.3 User Onboarding and Lifecycle (SUPER_ADMIN/IT_ADMIN)

1. SUPER_ADMIN can onboard IT_ADMIN (critical regression scenario).
2. IT_ADMIN can onboard regular users in same tenant.
3. User onboarding stores profile + auth identity + credentials setup flow.
4. Fetch onboarded user by userId.
5. Update user profile fields.
6. Lifecycle transitions: activate, deactivate, block, unblock.
7. Password reset request works with actor context.
8. Negative: duplicate userId rejected.
9. Negative: duplicate email rejected.
10. Negative: missing tenantId rejected.
11. Negative: unauthorized actor rejected.

APIs:

1. POST /api/v1/mdm/users/onboard
2. GET /api/v1/mdm/users/{userId}
3. GET /api/v1/mdm/users
4. PUT /api/v1/mdm/users/{userId}
5. PATCH /api/v1/mdm/users/{userId}/lifecycle
6. POST /api/v1/mdm/users/{userId}/password-reset
7. POST /api/v1/mdm/users/{userId}/activate
8. POST /api/v1/mdm/users/{userId}/deactivate
9. POST /api/v1/mdm/users/{userId}/block
10. POST /api/v1/mdm/users/{userId}/unblock

## 4.4 Groups, Roles, and Permissions

1. Create user group.
2. Create role.
3. Map role to group.
4. Map user to group.
5. Read mappings (roles in group, users in group).
6. Unmap role from group.
7. Unmap user from group.
8. Set role permissions and retrieve them.
9. Activate/deactivate role and group.
10. Verify login-context permission changes after mapping updates.

APIs:

1. POST /api/v1/mdm/user-groups
2. GET /api/v1/mdm/user-groups
3. GET /api/v1/mdm/user-groups/{groupId}
4. PUT /api/v1/mdm/user-groups/{groupId}
5. POST /api/v1/mdm/user-groups/{groupId}/activate
6. POST /api/v1/mdm/user-groups/{groupId}/deactivate
7. POST /api/v1/mdm/roles
8. GET /api/v1/mdm/roles
9. POST /api/v1/mdm/roles/{roleId}/permissions
10. GET /api/v1/mdm/roles/{roleId}/permissions
11. POST /api/v1/mdm/user-groups/{groupId}/roles
12. GET /api/v1/mdm/user-groups/{groupId}/roles
13. DELETE /api/v1/mdm/user-groups/{groupId}/roles/{roleId}
14. POST /api/v1/mdm/user-groups/{groupId}/users
15. GET /api/v1/mdm/user-groups/{groupId}/users
16. DELETE /api/v1/mdm/user-groups/{groupId}/users/{userId}

## 4.5 Plant Topology and Departments

1. Create plant.
2. Create block under plant.
3. Create area under block.
4. Create room under area.
5. Create department and department hierarchy.
6. Read list/tree views and detail views where applicable.
7. Update each entity.
8. Activate/deactivate each entity.
9. Negative: duplicate code per tenant/parent context rejected.

APIs:

1. POST /api/v1/mdm/plants
2. GET /api/v1/mdm/plants
3. GET /api/v1/mdm/plants/{plantId}
4. PUT /api/v1/mdm/plants/{plantId}
5. POST /api/v1/mdm/plants/{plantId}/activate
6. POST /api/v1/mdm/plants/{plantId}/deactivate
7. POST /api/v1/mdm/blocks
8. GET /api/v1/mdm/blocks
9. PUT /api/v1/mdm/blocks/{blockId}
10. DELETE /api/v1/mdm/blocks/{blockId}
11. POST /api/v1/mdm/blocks/{blockId}/activate
12. POST /api/v1/mdm/blocks/{blockId}/deactivate
13. POST /api/v1/mdm/areas
14. GET /api/v1/mdm/areas
15. PUT /api/v1/mdm/areas/{areaId}
16. DELETE /api/v1/mdm/areas/{areaId}
17. POST /api/v1/mdm/areas/{areaId}/activate
18. POST /api/v1/mdm/areas/{areaId}/deactivate
19. POST /api/v1/mdm/rooms
20. GET /api/v1/mdm/rooms
21. PUT /api/v1/mdm/rooms/{roomId}
22. DELETE /api/v1/mdm/rooms/{roomId}
23. POST /api/v1/mdm/rooms/{roomId}/activate
24. POST /api/v1/mdm/rooms/{roomId}/deactivate
25. POST /api/v1/mdm/departments
26. GET /api/v1/mdm/departments
27. GET /api/v1/mdm/departments/tree
28. PUT /api/v1/mdm/departments/{departmentId}
29. DELETE /api/v1/mdm/departments/{departmentId}
30. POST /api/v1/mdm/departments/{departmentId}/activate
31. POST /api/v1/mdm/departments/{departmentId}/deactivate

## 4.6 IIOT Master Data

1. Create IIOT asset.
2. Create asset tags for asset.
3. Create tag threshold.
4. Read, update, activate/deactivate each entity.
5. Negative: duplicate uniqueness constraints rejected.
6. Negative: invalid references (asset/tag IDs) rejected.

APIs:

1. POST /api/v1/iiot/assets
2. GET /api/v1/iiot/assets
3. GET /api/v1/iiot/assets/{assetId}
4. PUT /api/v1/iiot/assets/{assetId}
5. DELETE /api/v1/iiot/assets/{assetId}
6. POST /api/v1/iiot/assets/{assetId}/activate
7. POST /api/v1/iiot/asset-tags
8. GET /api/v1/iiot/asset-tags
9. GET /api/v1/iiot/asset-tags/{tagId}
10. PUT /api/v1/iiot/asset-tags/{tagId}
11. DELETE /api/v1/iiot/asset-tags/{tagId}
12. POST /api/v1/iiot/asset-tags/{tagId}/activate
13. POST /api/v1/iiot/tag-thresholds
14. GET /api/v1/iiot/tag-thresholds
15. GET /api/v1/iiot/tag-thresholds/{thresholdId}
16. PUT /api/v1/iiot/tag-thresholds/{thresholdId}
17. DELETE /api/v1/iiot/tag-thresholds/{thresholdId}
18. POST /api/v1/iiot/tag-thresholds/{thresholdId}/activate

## 4.7 DMS Supporting Documents

1. Upload supporting document for lifecycle/onboarding traceability.
2. Download document and verify integrity.
3. Negative: invalid file type or missing tenant/plant metadata rejected.

APIs:

1. POST /api/v1/dms/documents/upload
2. GET /api/v1/dms/documents/{documentId}/download

## 4.8 Metadata and UI Catalog Load

1. UI can fetch modules catalog.
2. UI can fetch screens catalog.
3. UI can fetch features catalog.
4. UI can fetch permission matrix tree.
5. Negative: verify behavior for unauthorized token.

APIs:

1. GET /api/v1/mdm/modules
2. GET /api/v1/mdm/screens
3. GET /api/v1/mdm/features
4. GET /api/v1/mdm/permissions/matrix-tree

## 4.9 Assignments API (Required for Multi-Plant Scope Setup)

For your case, this is required if the same user can belong to multiple plants and UI must drive plant selection after login.

Reason:

1. Role permissions decide what user can do.
2. Assignments decide where user can do it (plant/resource scope).
3. Multi-plant dropdown in login context depends on assigned plant mappings.

If plant mappings are managed outside UI (for example direct DB/admin script), assignments endpoints can be skipped in UI automation but still remain a backend dependency.

When applicable, test:

1. Grant assignment for user/resource.
2. Exclude assignment.
3. IIOT-specific grant/exclude flows.
4. List assignments.
5. Deactivate/activate assignment.

APIs (for scoped-access setup/maintenance):

1. POST /api/v1/mdm/assignments/grant
2. POST /api/v1/mdm/assignments/exclude
3. POST /api/v1/mdm/assignments/iiot/grant
4. POST /api/v1/mdm/assignments/iiot/exclude
5. GET /api/v1/mdm/assignments
6. DELETE /api/v1/mdm/assignments/{assignmentId}
7. POST /api/v1/mdm/assignments/{assignmentId}/activate

## 4.10 Audit and Compliance Verification (Cross-Cutting)

For each create/update/delete/activate/deactivate and auth flow above, verify:

1. Audit trail entry exists with expected action, entityType, entityId, status, actor userId.
2. Login history records successful and failed auth attempts correctly.
3. Tenant-scoped actions carry tenantId where applicable.

APIs:

1. GET /api/v1/audit/trails
2. GET /api/v1/audit/login-history

## 5. Mandatory Negative Test Matrix

1. Unauthorized requests without token should return 401/403.
2. Invalid actor context (missing/invalid X-User-Id) should fail where required.
3. Cross-tenant access should fail.
4. Duplicate unique keys should fail with business error (not 500).
5. Invalid payload fields should fail with validation error.
6. License seat or module restriction should block onboarding with clear error code.
7. Inactive/blocked users should be denied access.

## 6. API Availability Checklist for UI

1. Authentication: Available.
2. Tenant governance: Available.
3. License governance: Available.
4. User onboarding and lifecycle: Available.
5. Group-role-user mapping: Available.
6. Role permissions: Available.
7. Topology and department: Available.
8. IIOT masters: Available.
9. DMS upload/download: Available.
10. Metadata catalogs and permissions tree: Available.
11. Assignments: Required when users are mapped to multiple plants/resources.
12. Audit and login history: Available.

## 7. Exit Criteria

1. All critical happy-path flows pass.
2. All mandatory negative scenarios return expected error codes/messages.
3. No endpoint required by implemented UI remains untested.
4. Audit and login history evidence exists for all critical operations.
5. Regression scenario passes: SUPER_ADMIN can onboard IT_ADMIN (with tenant/license preconditions satisfied).


