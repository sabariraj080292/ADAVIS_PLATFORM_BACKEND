{
  "_id": ObjectId("6b00000111b6e6f110b20001"),
  "mappingId": "MAP-TNT-0001-RMG100L2PVII",
  "tenantId": "TNT-0001",
  "equipmentId": "RMG-100L-2-PVII",
  "batchSource": {
    "dbType": "SAP_HANA",
    "schemaName": "SKPharma",
    "tableName": "SKPharma::CDSSKPharma.B_UDA_RMG_100L_P7_2",
    "sequenceColumn": "SerialNumber",
    "timestampColumn": "LastModifiedTime"
  },
  "alarmEventSource": {
    "dbType": "SAP_HANA",
    "schemaName": "SKPharma",
    "tableName": "SKPharma::CDSSKPharma.AE_RMG100L_P7_2",
    "sequenceColumn": "id",
    "timestampColumn": "LastModifiedTime"
  },
  "pollIntervalSeconds": 30,
  "batchSize": 1000,
  "connectionRef": "SAP-HANA-DEV-01",
  "validationStatus": "SUCCESS",
  "lastValidatedAt": ISODate("2026-07-07T08:15:00Z"),
  "isActive": true,
  "createdAt": ISODate("2026-07-07T08:15:00Z"),
  "updatedAt": ISODate("2026-07-07T08:15:00Z")
}
