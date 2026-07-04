{
  "_id": ObjectId("648c6a09a3b4e21a2c3d0001"), // Default MongoDB unique auto ID
  "moduleId": "MOD-0001",                       // Unique system identifier key (Primary Relational Key)
  "moduleCode": "MOD-ELOG",                     // Static configuration code token parsed by authorization and menu engines
  "moduleName": "Electronic Logbook Management", // Human-readable naming title rendered on structural sidebar components
  "displayOrder": 1,                            // Sequential positioning layout parameter rendering order priority
  "isActive": true,                             // System toggle switch regulating interface execution availability
  "createdAt": ISODate("2026-01-01T00:00:00Z"), // Record generation timestamp
  "updatedAt": ISODate("2026-01-01T00:00:00Z")  // Last modified timestamp
}

db.modules.createIndex({ "moduleId": 1 }, { unique: true });
db.modules.createIndex({ "moduleCode": 1 }, { unique: true });
