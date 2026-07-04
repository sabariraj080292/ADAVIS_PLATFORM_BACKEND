{
  "_id": ObjectId("648c71b2a3b4e21a2c3d9101"), // Primary Key used as reference for child Areas
  "tenantId": "TNT-0001",                       // Scope multi-tenant client isolation parameter
  "plantId": "PLNT-0001",                       // Relational link to core corporate site facility
  "blockCode": "BLOCK_P7",                      // Unique business shorthand alphanumeric code (e.g., Phase 7)
  "blockName": "Production Block Phase 7",      // Human-readable clear title for UI screens
  "displayOrder": 1,                            // Rendering sequence priority parameter
  "isActive": true,                             // Status availability configuration toggle switch
  "createdAt": ISODate("2026-01-15T08:00:00Z"), // Timestamp
  "updatedAt": ISODate("2026-06-27T12:00:00Z")  // Timestamp
}

db.blocks.createIndex({ "tenantId": 1, "blockCode": 1 }, { unique: true });
