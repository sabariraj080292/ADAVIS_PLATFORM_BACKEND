{
  "_id": ObjectId("648c6a09a3b4e21a2c3d0002"), // Default MongoDB unique auto ID
  "_description": "Static registry defining full-page viewport routing targets nested under functional parent modules.",
  "screenId": "SCR-0001",                       // Unique screen identifier code (Primary Relational Key)
  "moduleId": "MOD-0001",                       // Parent structural identifier code mapping screen back onto its host module
  "screenCode": "SCR-ELOG-BATCH",               // Static routing token code used by front-end menu layout routers
  "screenName": "Batch Run Records Overview",   // Human-readable title descriptive text displayed on main headers
  "displayOrder": 1,                            // Sequential priority render order inside navigation matrices
  "isActive": true,                             // System toggle switch regulating viewport rendering authorizations
  "createdAt": ISODate("2026-01-01T00:00:00Z"), // Record generation timestamp
  "updatedAt": ISODate("2026-01-01T00:00:00Z")  // Last modified timestamp
}

db.screens.createIndex({ "screenId": 1 }, { unique: true });
db.screens.createIndex({ "screenCode": 1 }, { unique: true });
db.screens.createIndex({ "moduleId": 1 }); // Accelerates building module sub-trees on UI dashboards
