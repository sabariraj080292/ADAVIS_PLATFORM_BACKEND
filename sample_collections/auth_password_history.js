{
  "_id": ObjectId("648c6a51a3b4e21a2c3d001d"), // Default MongoDB unique auto ID
  "tenantId": "TNT-0001",                       // Scope tracking client partitioning parameters for multitenancy
  "userId": "jdoe_qa",                          // References the administrator-created unique username handle
  "passwordHash": "$2b$12$OldHistoricalHashValue19924kLmzNq2...", // Securely encrypted signature block of a retired password choice
  "createdAt": ISODate("2026-03-01T10:05:00Z")  // Timestamp marking exactly when this choice was replaced and retired
}

db.auth_password_history.createIndex({ "tenantId": 1, "userId": 1, "createdAt": -1 });
