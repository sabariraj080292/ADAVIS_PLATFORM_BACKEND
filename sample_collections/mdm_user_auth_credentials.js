{
  "_id": ObjectId("648c6a50a3b4e21a2c3d001c"), // Default MongoDB unique auto ID
  "userId": "jdoe_qa",                          // References the administrator-created unique username handle
  "tenantId": "TNT-0001",                       // Scope multi-tenant client segmentation partition key
  "passwordHash": "$2b$12$6K9fXyZnM92lK83jsH72kO8u1aXyB3mC4qO5rS6tU7vW8xY9zA1bC", // Securely encrypted secret hash string
  "passwordType": "TEMPORARY",                  // Tracks origin type: TEMPORARY (admin created), PERMANENT (user set)
  "isPasswordResetRequired": true,              // True forces the UI router to redirect user to reset password panel on first login
  "passwordChangedAt": ISODate("2026-06-27T09:11:00Z"), // Tracks credential age to evaluate cyclical expiration routines
  "failedLoginAttempts": 0,                      // Live incrementing counter checking consecutive authentication crashes
  "lockoutExpiresAt": null,                     // Expiration timeline stamp resetting brute-force block states
  "createdAt": ISODate("2026-03-01T10:05:00Z"), // Record generation timestamp
  "updatedAt": ISODate("2026-06-27T09:11:00Z")  // Last modified timestamp
}

db.auth_credentials.createIndex({ "userId": 1 }, { unique: true });
db.auth_credentials.createIndex({ "tenantId": 1, "userId": 1 }, { unique: true });
