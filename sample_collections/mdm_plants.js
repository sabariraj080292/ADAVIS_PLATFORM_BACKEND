{
  "_id": ObjectId("648c6a03a3b4e21a2c3d0003"), // Default MongoDB unique auto ID
  "plantId": "PLNT-0001",                       // Auto-generated sequence ID (System Foreign Key used for unyielding linkage)
  "tenantId": "TNT-0001",                       // Binds facility access and visibility tightly to its parent Tenant boundary
  "plantName": "Rensselaer Sterile Injectables Plant", // Full descriptive title of the physical facility
  "plantCode": "NY-01",                         // Short business acronym (Human & ERP/SAP integration validation key)
  "type": "Manufacturing",                      // Facility classification: Manufacturing, R&D, Warehouse, Corporate
  "address": {                                  // Physical location parameters mapped for regulatory audit profiles
    "street": "100 Pharma Way",
    "city": "Rensselaer",
    "state": "NY",
    "zipCode": "12144",
    "country": "USA"
  },
  "timezone": "America/New_York",               // Vital for 21 CFR Part 11 electronic timestamp localization calculations
  "isActive": true,                             // Operational toggle switch enabling/disabling facility configuration paths
  "createdAt": ISODate("2026-02-10T14:20:00Z"), // Record generation timestamp
  "updatedAt": ISODate("2026-05-19T11:05:22Z")  // Last modified timestamp
}

db.plants.createIndex({ "plantId": 1 }, { unique: true });
db.plants.createIndex({ "tenantId": 1, "plantCode": 1 }, { unique: true });