{
  "_id": ObjectId("648c71b2a3b4e21a2c3d8003"), // Default MongoDB unique auto ID
  "thresholdId": "THR-001042",                   // Auto-generated sequence ID (Database Linkage Key)
  "tenantId": "TNT-0001",                       // Binds safety rules securely within a specific multi-tenant customer space
  "plantId": "PLNT-0001",                       // Restricts rules context execution to a single facility
  "assetId": ObjectId("648c71b2a3b4e21a2c3d8001"), // Associated machinery inventory identity index pointer
  "tagId": ObjectId("648c71b2a3b4e21a2c3d8002"), // Associated physical sensor registry data point mapping key
  "tagCode": "IMPELLER_A",                      // Injected code checking processing constraints at the edge
  "condition": "GREATER_THAN",                  // Formula validation parameter: LESS_THAN, GREATER_THAN, EQUALS
  "warningThreshold": 55.0,                     // Reaching this alert level triggers a cleanroom dashboard flag
  "criticalThreshold": 65.0,                    // Reaching this critical limit triggers a GxP alarm violation log
  "targetValue": 45.0,                          // The ideal validated production manufacturing run recipe target value
  "validatedMethodSopCode": "SOP-VAL-0991",     // Linked pre-approved instruction standard authorizing these limits
  "isActive": true,                             // Boundary execution verification status validation toggle
  "isDeleted": false,                           // Soft delete containment workflow state parameter
  "createdAt": ISODate("2026-05-12T14:22:00Z"), // Timestamp
  "updatedAt": ISODate("2026-05-12T14:22:00Z")  // Timestamp
}
