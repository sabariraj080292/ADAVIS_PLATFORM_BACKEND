{
  "_id": ObjectId("648c6a04a3b4e21a2c3d0004"), // Default MongoDB unique auto ID
  "departmentId": "DEP-0002",                   // Auto-generated sequence ID (Internal System Linkage Key)
  "tenantId": "TNT-0001",                       // Binds organizational data access to the parent Tenant boundary
  "plantId": "PLNT-0001",                       // References the physical plant location host
  "departmentName": "QC Microbiology Lab",      // Full name of the internal functional department unit
  "departmentCode": "QC-MICRO",                 // Functional shorthand acronym (Human & ERP integration tracking code)
  "parentDepartmentId": "DEP-0001",             // Null for absolute top-level, references another departmentId for child nodes
  "path": "DEP-0001/DEP-0002",                  // Materialized path tracking string used for lightning-fast sub-tree queries
  "isActive": true,                             // Operational toggle switch enabling/disabling department visibility
  "createdAt": ISODate("2026-02-12T09:00:00Z"), // Record generation timestamp
  "updatedAt": ISODate("2026-02-12T09:00:00Z")  // Last modified timestamp
}

db.departments.createIndex({ "departmentId": 1 }, { unique: true });
db.departments.createIndex({ "tenantId": 1, "plantId": 1, "departmentCode": 1 }, { unique: true });
db.departments.createIndex({ "path": 1 }); // Essential for optimizing quick ancestral tree lookups
