{
  "_id": ObjectId("648c71b2a3b4e21a2c3d9102"), // Primary Key used as reference for child Rooms
  "tenantId": "TNT-0001",                       // Customer environment segmentation parameter
  "plantId": "PLNT-0001",                       // Enforces facility context scoping rules
  "blockId": ObjectId("648c71b2a3b4e21a2c3d9101"), // [FOREIGN KEY LINK] References the parent building Block
  "areaCode": "AREA_GRANULATION",               // Unique processing room sector short code
  "areaName": "Granulation Process Area",       // Human-readable layout descriptive title
  "isActive": true,                             // Operational lifecycle state tracker
  "createdAt": ISODate("2026-01-15T08:15:00Z"), // Timestamp
  "updatedAt": ISODate("2026-06-27T12:00:00Z")  // Timestamp
}

db.areas.createIndex({ "tenantId": 1, "areaCode": 1 }, { unique: true });
db.areas.createIndex({ "blockId": 1 }); // Optimizes area listings when a block is chosen
