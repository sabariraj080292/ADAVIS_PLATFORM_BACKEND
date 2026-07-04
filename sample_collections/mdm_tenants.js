{
  "_id": ObjectId("648c6a01a3b4e21a2c3d0001"), // Default MongoDB unique auto ID
  "tenantId": "TNT-0001",                       // Custom tenant identifier (Unique across platform)
  "companyName": "AstraBio Therapeutics Inc.",  // Full corporate legal name
  "domain": "://pharmacloud.com",         // Primary URL routing domain for tenant isolation
  "companyCode": "ABT",                         // Short acronym used for global data tagging
  "contactEmail": "compliance@astrabio.com",    // Master system notification address for compliance alerts
  "isActive": true,                             // Status state: Active, Suspended, Maintenance
  "createdAt": ISODate("2026-01-15T08:00:00Z"), // Record generation timestamp
  "updatedAt": ISODate("2026-06-27T07:12:45Z")  // Last modified timestamp
}

db.tenants.createIndex({ "tenantId": 1 }, { unique: true });
db.tenants.createIndex({ "domain": 1 }, { unique: true });
