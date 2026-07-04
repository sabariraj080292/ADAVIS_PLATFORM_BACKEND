{
  // Optimized using MongoDB Time-Series Collection Engines
  "timestamp": ISODate("2026-06-26T11:00:00Z"),  // MongoDB Time-Series Type: timeField
  "metaField": {                                 // MongoDB Time-Series Type: metaField
    "tenantId": "TNT-0001",                      // Client space partitioning parameter
    "tagId": "TAG-000182",                       // Core tracking descriptor matching physical data tags
    "batchNumber": "BTH-ASP-2026-99"             // Injected batch identifier linking telemetry directly to manufacturing data
  },
  "value": 37.01                                 // Numerical value storage array optimization element
}
