# Endpoint Payload Reference (Phase 1)

Purpose:
- Module by module request payload guide
- Quick check for missing fields and missing endpoints
- Aligned with current controllers and Phase 1 flow

Date: 2026-06-28

## 1. Auth Module

Base paths:
- /api/v1/auth

### POST /login-initiate
Required payload:
{
  "identifier": "super_admin@adavis.com"
}

Checks:
- identifier required

### POST /authenticate
Required payload:
{
  "identifier": "super_admin@adavis.com",
  "password": "Adavis@123"
}

Checks:
- identifier required
- password required

Notes:
- current auth implementation exposes canonical login routes only: `/login-initiate` and `/authenticate`

### POST /refresh
### POST /refresh/rotate
Required payload:
{
  "refreshToken": "<refresh-token>"
}

Checks:
- refreshToken required

### POST /logout
Payload:
- No body
- Authorization header optional in controller

### GET /me
Payload:
- No body
- Authorization header required

### GET /password/policy
Payload:
- No body

### POST /password/policy/verify
Required payload:
{
  "password": "Adavis@123"
}

Checks:
- password required

### POST /users/provision
Required payload:
{
  "userId": "USR-0001",
  "username": "john.doe@tenant.com",
  "initialPassword": "Temp@12345"
}

Optional fields:
{
  "email": "john.doe@tenant.com"
}

Checks:
- userId required
- username required
- initialPassword required by service (runtime validation)

## 2. Session Module (Auth)

Base paths:
- /api/v1/auth/sessions

### GET /
Payload:
- No body
- X-User-Id header required

### DELETE /{sessionId}
Payload:
- No body

### DELETE /all
Payload:
- No body
- X-User-Id header required

## 3. Tenant and Governance Module (MDM)

Base paths:
- /api/v1/mdm

### POST /tenants
Recommended payload:
{
  "companyName": "AstraBio Therapeutics Inc.",
  "domain": "https://astrabio.com",
  "companyCode": "ABT",
  "contactEmail": "compliance@astrabio.com"
}

Checks:
- companyCode strongly required in service
- tenantId must not be sent (system generated)

### PUT /tenants/{tenantId}
Recommended payload:
{
  "companyName": "AstraBio Therapeutics Updated",
  "domain": "https://astrabio.com",
  "companyCode": "ABT",
  "contactEmail": "compliance@astrabio.com",
  "isActive": true
}

### POST /tenants/{tenantId}/reactivate
Payload:
- No body

## 4. Plant Topology Module (MDM)

### POST /plants
{
  "tenantId": "TNT-0001",
  "plantName": "Rensselaer Sterile Injectables Plant",
  "plantCode": "NY-01",
  "type": "Manufacturing",
  "timezone": "America/New_York"
}

### PUT /plants/{plantId}
{
  "tenantId": "TNT-0001",
  "plantName": "Rensselaer Sterile Injectables Plant Updated",
  "plantCode": "NY-01",
  "type": "Manufacturing",
  "timezone": "America/New_York"
}

### POST /blocks
{
  "tenantId": "TNT-0001",
  "plantId": "PLNT-0001",
  "blockCode": "BLOCK_P7",
  "blockName": "Production Block Phase 7",
  "displayOrder": 1
}

### POST /areas
{
  "tenantId": "TNT-0001",
  "plantId": "PLNT-0001",
  "blockId": "BLK-0001",
  "areaCode": "AREA_GRANULATION",
  "areaName": "Granulation Process Area",
  "displayOrder": 1
}

### POST /rooms
{
  "tenantId": "TNT-0001",
  "plantId": "PLNT-0001",
  "areaId": "AREA-0001",
  "roomCode": "RM-P7-104",
  "roomName": "Granulation Cleanroom 104",
  "classification": "ISO_7"
}

## 5. Department Module (MDM)

Base paths:
- /api/v1/mdm/departments

### POST /
{
  "tenantId": "TNT-0001",
  "plantId": "PLNT-0001",
  "departmentCode": "QC-MICRO",
  "departmentName": "QC Microbiology Lab",
  "parentDepartmentId": "DEP-0001",
  "path": "DEP-0001/DEP-0002"
}

### PUT /{departmentId}
{
  "tenantId": "TNT-0001",
  "plantId": "PLNT-0001",
  "departmentCode": "QC-MICRO",
  "departmentName": "QC Microbiology Lab Updated",
  "parentDepartmentId": "DEP-0001",
  "path": "DEP-0001/DEP-0002"
}

## 6. User Module (MDM)

Base paths:
- /api/v1/mdm/users

### POST /onboard
### POST /
Required payload:
{
  "tenantId": "TNT-0001",
  "userId": "USR-0001",
  "username": "john.doe@astrabio.com",
  "email": "john.doe@astrabio.com",
  "initialPassword": "Temp@12345"
}

Recommended full payload:
{
  "tenantId": "TNT-0001",
  "userId": "USR-0001",
  "username": "john.doe@astrabio.com",
  "email": "john.doe@astrabio.com",
  "firstName": "John",
  "lastName": "Doe",
  "departmentId": "DEP-0002",
  "designation": "QA Specialist",
  "phoneNumber": "+1-555-123-4567",
  "title": "Senior Quality Assurance Specialist",
  "userType": "INTERNAL_EMPLOYEE",
  "lifecycleStatus": "ACTIVE",
  "empId": "EMP-88412",
  "isExternal": false,
  "isActive": true,
  "itAdminUserId": "IT_ADMIN",
  "supportingDocumentIds": ["DOC-DMS-881024"],
  "supportingDocumentType": "PHYSICAL_SIGN_OFF_FORM",
  "reason": "New joiner onboarding",
  "initialPassword": "Temp@12345"
}

Checks:
- email required
- initialPassword required

### PATCH /{userId}/lifecycle
{
  "action": "ACTIVATE",
  "itAdminUserId": "IT_ADMIN",
  "supportingDocumentIds": ["DOC-DMS-881024"],
  "supportingDocumentType": "PHYSICAL_SIGN_OFF_FORM",
  "reason": "Lifecycle update"
}

### POST /{userId}/password-reset
Current payload:
{
  "tempPassword": "Temp@12345",
  "itAdminUserId": "IT_ADMIN",
  "supportingDocumentIds": ["DOC-DMS-881024"],
  "supportingDocumentType": "PHYSICAL_SIGN_OFF_FORM",
  "reason": "Requested by user"
}

Checks:
- tempPassword required
- email not required in current flow

## 7. Group and Role Module (MDM)

### POST /user-groups
{
  "tenantId": "TNT-0001",
  "groupCode": "SR-QA-LEAD",
  "groupName": "Senior QA Plant Leads",
  "roleIds": ["ROLE-0001"],
  "description": "QA leads group"
}

### PUT /user-groups/{groupId}
{
  "tenantId": "TNT-0001",
  "groupCode": "SR-QA-LEAD",
  "groupName": "Senior QA Plant Leads Updated",
  "roleIds": ["ROLE-0001", "ROLE-0002"],
  "description": "Updated",
  "isActive": true
}

### POST /roles
{
  "tenantId": "TNT-0001",
  "roleCode": "QA_REV",
  "roleName": "Quality Assurance Reviewer",
  "description": "Can review and approve records",
  "parentRoleId": null,
  "level": 1,
  "isActive": true
}

### PUT /roles/{roleId}
{
  "tenantId": "TNT-0001",
  "roleCode": "QA_REV",
  "roleName": "Quality Assurance Reviewer Updated",
  "description": "Updated",
  "parentRoleId": null,
  "level": 1,
  "isActive": true
}

### POST /roles/{roleId}/permissions
{
  "moduleId": "MOD-0001",
  "version": 1,
  "isActive": true,
  "screenPermissions": [
    {
      "screenId": "SCR-0001",
      "actions": ["READ", "WRITE"],
      "deniedActions": []
    }
  ],
  "featurePermissions": [
    {
      "featureId": "FEAT-0001",
      "actions": ["READ", "APPROVE"],
      "deniedActions": []
    }
  ]
}

## 8. Assignment Module (MDM)

### POST /assignments/grant
{
  "tenantId": "TNT-0001",
  "userId": "USR-0001",
  "plantId": "PLNT-0001",
  "departmentId": "DEP-0002",
  "groupId": "GRP-0001"
}

### POST /assignments/exclude
{
  "tenantId": "TNT-0001",
  "userId": "USR-0001",
  "plantId": "PLNT-0001",
  "departmentId": "DEP-0002",
  "groupId": "GRP-0001"
}

### POST /assignments/iiot/grant
{
  "tenantId": "TNT-0001",
  "userId": "USR-0001",
  "plantId": "PLNT-0001",
  "assetId": "EQP-RMG-0042"
}

### POST /assignments/iiot/exclude
{
  "tenantId": "TNT-0001",
  "userId": "USR-0001",
  "plantId": "PLNT-0001",
  "assetId": "EQP-RMG-0042"
}

## 9. IIOT Master Module

Base paths:
- /api/v1/iiot

### POST /assets
{
  "assetId": "EQP-RMG-0042",
  "assetCode": "RMG_100L_P7_2",
  "assetName": "Rapid Mixer Granulator 100L",
  "assetType": "EQUIPMENT",
  "category": "PROCESS",
  "tenantId": "TNT-0001",
  "plantId": "PLNT-0001",
  "roomId": "ROOM-0001",
  "isActive": true
}

### POST /asset-tags
{
  "tagId": "TAG-000512",
  "assetId": "EQP-RMG-0042",
  "assetCode": "RMG_100L_P7_2",
  "tagCode": "IMPELLER_A",
  "tagName": "Main Impeller Amperage Draw",
  "dataType": "Float",
  "unitOfMeasure": "Amperes",
  "sampleIntervalMs": 1000,
  "isActive": true
}

### POST /tag-thresholds
{
  "thresholdId": "THR-001042",
  "assetId": "EQP-RMG-0042",
  "tagId": "TAG-000512",
  "tagCode": "IMPELLER_A",
  "condition": "GREATER_THAN",
  "warningThreshold": 55.0,
  "criticalThreshold": 65.0,
  "targetValue": 45.0,
  "validatedMethodSopCode": "SOP-VAL-0991",
  "isActive": true
}

## 10. DMS Module (in MDM)

### POST /api/v1/dms/documents/upload
Content type:
- multipart/form-data

Form fields:
- file: binary (required)
- tenantId: string (required)
- plantId: string (required)
- uploadedBy: string (required)

### GET /api/v1/dms/documents/{documentId}/download
Payload:
- No body

## 11. License Module

Base paths:
- /api/v1/mdm/license
- /api/v1/mdm/licenses

### POST /apply
{
  "actionType": "ACTIVATE",
  "encryptedLicenseToken": "<signed-token>",
  "performedBy": "SUPER_ADMIN",
  "reason": "Initial activation"
}

Checks:
- actionType required and must be one of ACTIVATE, UPGRADE, RENEW, SUSPEND, REACTIVATE
- encryptedLicenseToken required

### POST /validate
{
  "moduleId": "MOD_MDM",
  "currentUserCount": 120
}

### POST /tenant/{tenantId}/validate
{
  "moduleId": "MOD_MDM",
  "currentUserCount": 120
}

### PATCH /tenant/{tenantId}/user-count
Payload:
- No body
- Query params required: userCount

## 12. Audit Module

Base paths:
- /api/v1/audit
- /api/v1/mdm/audit-logs
- /api/v1/mdm/audit-logs

### GET /trails
Payload:
- No body
- Query params optional: userId, page, size

### GET /login-history
Payload:
- No body
- Query params optional: from, to, page, size

## 13. Missing or Misaligned Items (Important)

1) Missing endpoint from Phase 1 reference
- Expected: POST /api/v1/mdm/setup/bootstrap-admins
- Current code: not found in controllers

2) Session initialize contract gap
- Phase 1 flow expects context lock payload in session-initialize
- Current implementation maps /session-initialize to login payload only:
  {
    "identifier": "...",
    "password": "..."
  }
- Suggested Phase 1 payload (if separated endpoint is implemented):
  {
    "userId": "USR-0001",
    "plantIdContext": "PLNT-0001",
    "departmentIdContext": "DEP-0002",
    "groupIdContext": "GRP-0001"
  }

3) License route naming mismatch
- Phase 1 reference mentions tenant-scoped routes like /licenses/tenant and /licenses/{id}/upgrade
- Current implementation uses /license|licenses + /apply action workflow
- Recommendation: keep both via gateway aliasing if clients already use old routes

4) Deferred IIOT runtime endpoints
- Deferred in Phase 1 reference: live-status and telemetry/history
- Current iiot-service includes only master configuration endpoints, which is aligned

## 14. Fast Validation Checklist Before Client Rollout

- Confirm all client-facing modules use only endpoints in this file
- Confirm no UI/API call still targets removed auth reset APIs
- Confirm all onboarding and password reset flows are IT admin driven via MDM
- Confirm bootstrap-admins endpoint decision: implement or remove from Phase 1 reference
- Confirm session-initialize contract decision: merged with login or separate context endpoint
- Confirm the only intentional multi-base-path controllers are for groups/user-groups, DMS compatibility, and audit aliasing
