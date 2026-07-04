{
  "_id": ObjectId("648c6a12a3b4e21a2c3d0013"), // Default MongoDB unique auto ID
  "tenantId": "TNT-0001",                       // Binds safety rules securely within a specific multi-tenant customer space
  "policyName": "Global GxP Password Security Directive", // Human-readable governance naming label
  "minLength": 12,                              // Minimum character length validation threshold
  "requireSpecialChar": true,                   // Enforces symbol verification matching loops at credential entry
  "requireNumbers": true,                       // Enforces numeric string evaluation loops at submission
  "requireMixedCase": true,                     // Enforces mixed uppercase/lowercase validation checking rules
  "passwordExpiryDays": 60,                     // Triggers mandatory cyclical credential rotation tasks at threshold
  "historyRetentionCount": 5,                   // Number of old hashes cached to block immediate password reuse cycles
  "maxLoginAttempts": 3,                        // Brute-force failure count threshold before account is auto-blocked
  "lockoutDurationMinutes": 15,                 // Freeze period duration before an auto-locked account can retry login
  "createdAt": ISODate("2026-01-15T09:00:00Z"), // Record generation timestamp
  "updatedAt": ISODate("2026-01-15T09:00:00Z")  // Last modified timestamp
}

db.mdm_password_policies.createIndex({ "tenantId": 1 }, { unique: true });
