{
  "_id": ObjectId("648c6a05a3b4e21a2c3d0005"), // Default MongoDB unique auto ID
  "userTrackId": "USR-0001",                    // Auto-generated tracking sequence number for backend sorting
  "tenantId": "TNT-0001",                       // Scope master data isolation parameter linking user to Tenant
  "userId": "jdoe_qa",                          // Unique administrator-created user handle (Unique Primary Login Key)
  "firstName": "John",                          // Given employee name
  "lastName": "Doe",                            // Family name
  "phoneNumber": "+1-555-123-4567",             // Direct contact number used for voice or SMS validation workflows
  "title": "Senior Quality Assurance Specialist", // Mandatory profile job title populated on electronic signature stamps
  "userType": "INTERNAL_EMPLOYEE",                 // INTERNAL_EMPLOYEE, EXTERNAL_VENDOR, REGULATORY_AUDITOR
  "lifecycleStatus": "ACTIVE",                  // Real-time account status: ACTIVE, INACTIVE, BLOCKED
  "email": "john.doe@astrabio.com",             // Optional: Identity communication routing point
  "empId": "EMP-88412",                         // Optional: Enterprise internal physical personnel inventory badge index code
  "isActive": true,                             // Operational lifecycle state tracker
  "isBlocked": false,                           // Soft delete data mapping isolation criteria flag
  "createdAt": ISODate("2026-03-01T10:00:00Z"), // Record generation timestamp
  "updatedAt": ISODate("2026-06-27T09:29:00Z")  // Last modified timestamp
}

db.users.createIndex({ "userId": 1 }, { unique: true }); // Admin created username must be strictly unique globally
db.users.createIndex({ "userTrackId": 1 }, { unique: true }); 
db.users.createIndex({ "tenantId": 1, "userId": 1 }, { unique: true }); // Fences unique usernames inside a specific tenant

