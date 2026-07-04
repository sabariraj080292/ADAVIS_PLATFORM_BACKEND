{
  "_id": ObjectId("648c71b2a3b4e21a2c3d8004"), // Default MongoDB unique auto ID
  "tagId": "TAG-000182",                        // Database linkage key pointing to the target tag profile
  "assetId": "EQP-BIO-0042",                    // Database linkage key pointing to the host asset machine
  "tagCode": "NY_BR42_TEMP_PV",                 // Injected code string to stream data to front-end UI charts instantly
  "value": "37.02",                             // Current live reading text value streamed from the physical machine PLC
  "qualityStatus": "Good",                      // OPC industry status trace code criteria: Good, Bad, Uncertain
  "timestamp": ISODate("2026-06-26T11:00:00Z")  // Live streaming timestamp updated on a 1-second interval grid
}

