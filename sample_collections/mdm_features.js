{
  "_id": ObjectId("648c6a10a3b4e21a2c3d0011"), // Default MongoDB unique auto ID
  "featureId": "FEAT-0001",                     // Unique feature identifier code (Primary Relational Key)
  "moduleId": "MOD-0001",                       // Parent structural trace path pointer
  "screenId": "SCR-0001",                       // Parent structural trace path pointer
  "featureCode": "FEAT-ELOG-REV-PANEL",         // Shorthand string identifier code matching code-level UI components
  "featureName": "Batch Record Review Action Panel", // Human-readable feature grouping label description name
  "displayOrder": 1,                            // Relative positioning render coordinate parameter priority
  "isActive": true,                             // System toggle switch regulating component level enablement switches
  "createdAt": ISODate("2026-01-01T00:00:00Z"), // Record generation timestamp
  "updatedAt": ISODate("2026-01-01T00:00:00Z")  // Last modified timestamp
}

db.features.createIndex({ "featureId": 1 }, { unique: true });
db.features.createIndex({ "featureCode": 1 }, { unique: true });
db.features.createIndex({ "screenId": 1 }); // Optimizes fetching feature matrices during checkbox tree builds
