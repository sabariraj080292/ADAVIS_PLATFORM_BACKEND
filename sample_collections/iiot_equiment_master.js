{
  "_id": ObjectId("648c71b2a3b4e21a2c3d8001"), // Default MongoDB unique auto ID
  "equipmentId": "EQP-RMG-0042",                    // Auto-generated sequence ID (Internal DB Linkage Key)
  "tenantId": "TNT-0001",                       // Core multi-tenant client isolation parameter
  "plantId": "PLNT-0001",                       // Binds access control parameters directly to a physical facility
  "blockId": "BLK-0001",                       // Relational Link pointing straight to your blocks collection _id
  "areaId": "AR-0001",                           // Relational Link pointing straight to your areas collection _id
  "roomId": "RM-0001",                          // Relational Link pointing straight to your rooms collection _id
  "equipmentCode": "RMG_100L_P7_2",                 // Equipment identifier matching your SAP HANA script reference
  "equipmentName": "Rapid Mixer Granulator 100L",   // Human-readable name of the equipment
  "type": "MANUFACTURING",                     // Assembly type indicator: EQUIPMENT, ASSEMBLY, COMPONENT
  "category": "PROCESS",                        // Core process layout group: UTILITY, PROCESS, LABORATORY
  "isActive": true,                             // Equipment execution enablement safety switch indicator
  "createdAt": ISODate("2026-03-15T08:00:00Z"), // Record generation timestamp
  "updatedAt": ISODate("2026-06-27T12:00:00Z")  // Last modified timestamp
}