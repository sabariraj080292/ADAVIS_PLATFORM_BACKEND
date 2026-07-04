{
  "_id": ObjectId("648c6a02a3b4e21a2c3d0199"), // Default MongoDB unique auto ID
  "historyId": "LIC-HIST-00412",                // Auto-generated tracking sequence ID
  "tenantId": "TNT-0001",                       // Binds historical context to specific customers
  "licenseId": "LIC-99018A",                    // Links directly back to the primary license profile document
  "actionType": "UPGRADE_SEATS",                // RENEWAL, PLAN_CHANGE, UPGRADE_SEATS, SUSPENSION
  "comments": "Customer requested an increase in user seat capacity to accommodate new hires", // Optional free-text notes field
  "previousSnapshot": {                         // Captures what the layout looked like BEFORE this update
    "planId": "PLAN_ENTERPRISE",
    "maxUsersLimit": 100,
    "expiryDate": ISODate("2026-06-01T00:00:00Z")
  },
  "newSnapshot": {                              // Captures the updated parameters after encryption parsing
    "planId": "PLAN_ENTERPRISE",
    "maxUsersLimit": 200,
    "expiryDate": ISODate("2027-01-01T00:00:00Z")
  },
  "itAdminUserId": "USR-0842",                  // The administrator who uploaded and applied the new license file
  "uploadedLicenseToken": "eyJhY2Nlc3MiOi...",  // Retains a historical record of the specific file hash uploaded
  "timestamp": ISODate("2026-06-27T10:45:00Z")  // Event logging execution timeline timestamp record
}
