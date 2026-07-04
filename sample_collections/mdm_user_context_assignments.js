{
  "_id": ObjectId("648c9f10a3b4e21a2c3d0010"), // Default MongoDB unique auto ID
  "assignmentId": "ASGN-000001",                // Auto-generated sequence ID (Unique tracking business key)
  "tenantId": "TNT-0001",                       // Binds mapping visibility within the customer's multi-tenant walls
  "userId": "jdoe_qa",                          // References the administrator-created unique username
  "plantId": "PLNT-0001",                       // References the physical manufacturing facility site
  "departmentId": "DEP-0002",                   // References the specific department instance inside that facility
  "groupId": "GRP-0001",                        // References the user group containing active roles and permissions
  "isActive": true,                             // Active toggle switch to enable/disable this specific mapping instantly
  "createdAt": ISODate("2026-03-01T10:15:00Z"), // Record generation timestamp
  "updatedAt": ISODate("2026-03-01T10:15:00Z")  // Last modified timestamp
}

db.mdm_user_context_assignments.createIndex({ "assignmentId": 1 }, { unique: true });
db.mdm_user_context_assignments.createIndex({ "tenantId": 1, "userId": 1, "plantId": 1, "departmentId": 1, "groupId": 1 }, { unique: true });
db.mdm_user_context_assignments.createIndex({ "plantId": 1, "departmentId": 1 }); // Optimizes real-time dashboard roster lookups
