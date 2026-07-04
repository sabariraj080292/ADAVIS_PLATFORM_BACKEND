{
  "_id": ObjectId("648c82b3a3b4e21a2c3d0500"), // Default MongoDB unique auto ID
  "documentId": "DOC-DMS-881024",               // Unique auto-generated document tracking ID (Business Foreign Key)
  "tenantId": "TNT-0001",                       // Core multi-tenant isolation anchor separating files by customer
  "plantId": "PLNT-0001",                       // Binds the document's visibility to a specific physical plant context
  "fileName": "REQ-0042_JohnDoe_Signed.pdf",     // Original name of the scanned physical form uploaded by the admin
  "mimeType": "application/pdf",                // Standard file classification type identifier
  "fileSizeBytes": 1420500,                     // File size footprint recorded for capacity monitoring
  "repositoryDetails": {                        // Absolute storage routing parameters mapping to the Object Store repository
    "storageProvider": "MINIO",                 // Cloud or On-Prem provider: MINIO, AWS_S3, AZURE_BLOB
    "bucketName": "pharmacloud-tnt0001-dms",    // Isolated multi-tenant repository storage bucket
    "objectKey": "user-lifecycle-forms/DOC-DMS-881024.pdf" // Exact folder path mapping inside the object repository
  },
  "sha256Checksum": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", // [MANDATORY FOR PHARMA] Cryptographic file fingerprint to prove the uploaded PDF was never altered
  "uploadedBy": "m_smith_admin",                // The IT Administrator who uploaded the document from the UI
  "createdAt": ISODate("2026-06-27T09:43:00Z"), // Upload timestamp
  "updatedAt": ISODate("2026-06-27T09:43:00Z")  // Last modification timestamp
}

db.dms_documents.createIndex({ "documentId": 1 }, { unique: true });
db.dms_documents.createIndex({ "tenantId": 1, "plantId": 1 });
db.dms_documents.createIndex({ "sha256Checksum": 1 });
