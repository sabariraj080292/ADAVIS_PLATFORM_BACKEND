{
  "_id": ObjectId("648c6a07a3b4e21a2c3d0007"), // Default MongoDB unique auto ID
  "roleId": "ROLE-0001",                        // Unique Role identifier code (Unique Primary Key)
  "tenantId": "TNT-0001",                       // Binds role visibility securely within a specific customer tenant partition
  "roleName": "Quality Assurance Reviewer",     // Human-readable title descriptive label for UI management
  "roleCode": "QA_REV",                         // Dynamic code token utilized by frontend router constants and logic controllers
  "isActive": true,                             // Status switch enabling or disabling role deployment across groups
  "createdAt": ISODate("2026-01-20T10:30:00Z"), // Record generation timestamp
  "updatedAt": ISODate("2026-01-20T10:30:00Z")  // Last modified timestamp
}

db.roles.createIndex({ "roleId": 1 }, { unique: true });
db.roles.createIndex({ "tenantId": 1, "roleCode": 1 }, { unique: true });
