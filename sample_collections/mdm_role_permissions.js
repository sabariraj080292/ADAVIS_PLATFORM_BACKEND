// Suggested UI-compatible permission matrix model for creating/updating role permissions.
// This file includes:
// 1) UI payload shape (permission_matrix)
// 2) Normalized MongoDB storage shape (mdm_role_permissions)

// 1) UI payload (permission_matrix)
{
  "tenantId": "TNT-0001",
  "roleId": "ROLE-0001",
  "version": 3,
  "isActive": true,
  "actionCatalog": ["READ", "WRITE", "APPROVE"],
  "permissionMatrix": [
    {
      "moduleId": "MOD-0001",
      "moduleCode": "MOD-ELOG",
      "moduleName": "Electronic Logbook Management",
      "screens": [
        {
          "screenId": "SCR-0001",
          "screenCode": "SCR-ELOG-BATCH",
          "screenName": "Batch Run Records Overview",
          "actions": ["READ", "WRITE", "APPROVE"],
          "features": [
            {
              "featureId": "FEAT-0001",
              "featureCode": "FEAT-ELOG-REV-PANEL",
              "featureName": "Batch Record Review Action Panel",
              "actions": ["READ", "WRITE", "APPROVE"]
            },
            {
              "featureId": "FEAT-0002",
              "featureCode": "FEAT-ELOG-EDIT",
              "featureName": "Batch Edit Panel",
              "actions": ["READ", "WRITE"]
            }
          ]
        }
      ]
    }
  ],
  "updatedBy": "it_admin_001",
  "updatedAt": "2026-07-01T09:15:00Z"
}

// 2) Normalized storage document (save into mdm_role_permissions)
// This is aligned with RolePermission entity:
// - roleId, moduleId, version, isActive, effectiveFrom, effectiveTo
// - screenPermissions[] => screenId, actions[], featurePermissions[]
{
  "_id": ObjectId("66818a08a3b4e21a2c3d0120"),
  "tenantId": "TNT-0001",
  "roleId": "ROLE-0001",
  "moduleId": "MOD-0001",
  "version": 3,
  "isActive": true,
  "effectiveFrom": ISODate("2026-07-01T00:00:00Z"),
  "effectiveTo": null,
  "screenPermissions": [
    {
      "screenId": "SCR-0001",
      "actions": ["READ", "WRITE", "APPROVE"],
      "featurePermissions": [
        {
          "featureId": "FEAT-0001",
          "actions": ["READ", "WRITE", "APPROVE"]
        },
        {
          "featureId": "FEAT-0002",
          "actions": ["READ", "WRITE"]
        }
      ]
    }
  ],
  "createdAt": ISODate("2026-07-01T09:00:00Z"),
  "updatedAt": ISODate("2026-07-01T09:15:00Z")
}

// Recommended index for one active module-scope permission document per role:
db.mdm_role_permissions.createIndex(
  { "tenantId": 1, "roleId": 1, "moduleId": 1, "version": 1 },
  { unique: true }
);

// UI render order recommendation:
// modules.displayOrder -> screens.displayOrder -> features.displayOrder
// from modules, screens, and features collections.

// UI visibility rules:
// 1) Show a screen only when it has at least one feature with non-empty actions.
// 2) If a module has zero visible screens/features after filtering, do not show the module.
// 3) SUPER_ADMIN and IT_ADMIN receive full access to all MDM module/screen/feature actions by default.
// 4) Final module visibility in UI is restricted by licensed modules for the tenant.

