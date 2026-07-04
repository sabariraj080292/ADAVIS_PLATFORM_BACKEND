{
  "_id": ObjectId("648c6a02a3b4e21a2c3d0002"), // Default MongoDB unique auto ID
  "tenantId": "TNT-0001",                       // Scope multi-tenant client segmentation key
  "licenseId": "LIC-0001",                    // Business contract validation key (Unique)
  "plan": {
    "planId": "PLAN_ENTERPRISE",                // Plan code used by layout engines
    "planName": "Enterprise",                   // Human-readable title
    "planType": "PAID"                          // TRIAL, PAID, COMPLIMENTARY
  },
  "modules": ["MOD_MDM", "MOD_IIOT"],           // Array storing authorized high-level module codes
  "maxUsersLimit": 200,                              // Maximum seat limit allowed for employee profiles
  "status": "ACTIVE",                           // Current operational state: ACTIVE, EXPIRED, SUSPENDED
  "actionType": "UPGRADE_SEATS",                // RENEWAL, PLAN_CHANGE, UPGRADE_SEATS, SUSPENSION
  "comments": "Upgraded to 200 seats as per customer request", // Optional free-text notes field
  "startDate": ISODate("2026-01-01T00:00:00Z"), // Activation contract validation start timestamp
  "expiryDate": ISODate("2027-01-01T00:00:00Z"),// Platform validation lifecycle expiration date
  "encryptedLicenseToken": "eyJhY2Nlc3MiOi...[Long Encrypted/Signed JWT String]...", // The encrypted payload containing the verification block signed by your private key
  "createdAt": ISODate("2026-01-01T09:30:00Z"), // Record generation timestamp
  "updatedAt": ISODate("2026-06-27T10:45:00Z")  // Last modified timestamp
}

db.licenses.createIndex({ "tenantId": 1 }, { unique: true });
db.license_history.createIndex({ "tenantId": 1, "timestamp": -1 });
