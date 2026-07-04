{
  "_id": "648c6a20a3b4e21a2c3d001b",            // [PRIMARY KEY] The session unique string identifier used as the document _id
  "tenantId": "TNT-0001",                       // Bounds session data access within the client's multi-tenant walls
  "userId": "jdoe_qa",                          // References the administrator-created unique username handle
  "plantIdContext": "PLNT-0001",                 // Current active plant location context lock enforcing strict data fencing
  "departmentIdContext": "DEP-0002",            // Current active department context lock enforcing operational workspace isolation
  "groupIdContext": "GRP-0001",                 // Tracks the active user group ID authorizing this specific session
  "roleCodesContext": [                         // Caches the active role codes inherited from the Group for fast middleware evaluation
    "QA_REV",
    "PLANT_ADMIN"
  ],
  "ipAddress": "192.168.10.45",                 // Source network terminal IP address required for audit trail tracking logs
  "deviceInfo": "Chrome Mac OS X",              // Workstation browser configuration profiling telemetry signature
  "lastActivityAt": ISODate("2026-06-27T11:28:00Z"), // Updated on every API request to calculate automated inactivity lockouts
  "createdAt": ISODate("2026-06-27T08:30:01Z"),      // Session token initialization timestamp
  "expiresAt": ISODate("2026-06-27T16:30:01Z")       // Target timestamp driving automated MongoDB TTL self-cleaning
}


db.user_sessions.createIndex({ "tenantId": 1, "userId": 1 });

// ⏱️ THE AUTOMATED TTL INDEX
// Automatically removes expired sessions from the database cache cluster with zero manual maintenance
db.user_sessions.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 });
