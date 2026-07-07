{
  "_id": ObjectId("648c71b2a3b4e21a2c3d9103"), // Primary Key used as reference for Collection Points
  "tenantId": "TNT-0001",                       // Binds data securely within tenant partition lines
  "plantId": "PLNT-0001",                       // Enforces facility context isolation
  "areaId": ObjectId("648c71b2a3b4e21a2c3d9102"), // [FOREIGN KEY LINK] References the parent functional Area
  "roomCode": "RM-P7-104",                      // Unique cleanroom door tracking code layout marker
  "roomName": "Granulation Cleanroom 104",      // Clear title description name rendered on dashboards
  "isActive": true,                             // Room execution visibility validation condition tracking
  "createdAt": ISODate("2026-01-15T08:30:00Z"), // Timestamp
  "updatedAt": ISODate("2026-06-27T12:00:00Z")  // Timestamp
}


db.rooms.createIndex({ "tenantId": 1, "roomCode": 1 }, { unique: true });
db.rooms.createIndex({ "areaId": 1 }); // Optimizes room dropdown populating routines
