{
  "_id": ObjectId("648c6a06a3b4e21a2c3d0006"), // Default MongoDB unique auto ID
  "groupId": "GRP-0001",                        // Unique User Group identifier code (Unique Primary Key)
  "tenantId": "TNT-0001",                       // Binds group configurations within a specific multi-tenant customer workspace
  "groupName": "Senior QA Plant Leads",         // Human-readable team description label
  "groupCode": "SR-QA-LEAD",                    // System parsing lookup code reference identifier matching layout filters
  "isActive": true,                             // System container activation toggle switch indicator
  "isDeleted": false,                           // Soft delete tracking status property definition
  "createdAt": ISODate("2026-01-20T11:00:00Z"), // Record generation timestamp
  "updatedAt": ISODate("2026-05-10T16:45:00Z")  // Last modified timestamp
}

db.user_groups.createIndex({ "groupId": 1 }, { unique: true });
db.user_groups.createIndex({ "tenantId": 1, "groupCode": 1 }, { unique: true }); // Fences unique user group codes inside a specific tenant partition
