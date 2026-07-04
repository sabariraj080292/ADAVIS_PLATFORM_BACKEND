{
  "_id": ObjectId("648c71b2a3b4e21a2c3d8002"), // Default MongoDB unique auto ID
  "tagId": "TAG-000512",                        // Auto-generated sequence ID (Primary Data Lineage Key)
  "tenantId": "TNT-0001",                       // Bounds sensor configurations within customer spaces
  "assetId": ObjectId("648c71b2a3b4e21a2c3d8001"), // Links sensor directly back to its parent asset _id
  "assetCode": "RMG_100L_P7_2",                 // Injected machine code string for high-speed edge lookup matches
  "tagCode": "IMPELLER_A",                      // Unified tag string match parameter: IMPELLER_A, CHOPPER_A, ALARM_ALL
  "tagName": "Main Impeller Amperage Draw",     // Human-descriptive title explaining sensor purpose
  "dataType": "Float",                          // Storage variable validation data type: Float, Integer, Boolean, String
  "unitOfMeasure": "Amperes",                   // Standardized physical telemetry tracking metric label
  "sampleIntervalMs": 1000,                     // Polling frequency criteria measuring read intervals (1 second)
  "gxpImpact": true,                            // True triggers mandatory audit logs on threshold shifts
  "isActive": true,                             // Reading lifecycle verification state toggle switch
  "isDeleted": false,                           // Soft delete logic constraint variable
  "createdAt": ISODate("2026-03-15T08:30:00Z"), // Timestamp
  "updatedAt": ISODate("2026-03-15T08:30:00Z")  // Timestamp
}
