{
  "_id": ObjectId("648c6b12a3b4e21a2c3d0100"), // Default MongoDB unique auto ID
  "requestId": "REQ-USR-2026-0042",             // Auto-generated tracking business sequence reference key (Unique)
  "tenantId": "TNT-0001",                       // Customer space partition multi-tenant isolation token
  "targetUserId": "jdoe_qa",                    // References the administrator-created unique username being modified
  "requestType": "FORGOT_PASSWORD",             // Pipeline execution type: NEW_USER, FORGOT_PASSWORD, LIFECYCLE_CHANGE
  "lifecycleAction": null,                      // Explicit shift sub-type: ACTIVATE, DEACTIVATE, BLOCK, UNBLOCK
  "requestStatus": "COMPLETED",                 // Real-time state machine track: DRAFT, PENDING_APPROVAL, COMPLETED, REJECTED
  "itAdminUserId": "m_smith_admin",             // References the admin username who verified the paper form and submitted the change
  "supportingDocuments": [                      // Array tracking scanned physical sign-off documents ingested from the cleanroom floor
    {
      "documentId": "DOC-DMS-881024",           // Primary reference identifier targeting the core Document Repository file record
      "documentType": "PHYSICAL_SIGN_OFF_FORM", // Categorization lookup label: PHYSICAL_SIGN_OFF_FORM, AMENDMENT_MANDATE
      "fileName": "REQ-0042_JohnDoe_Signed.pdf", // Raw alphanumeric filename string recorded during upload ingest
      "uploadedBy": "m_smith_admin",            // Automatically locked to the current executing itAdminUserId session context
      "uploadedAt": ISODate("2026-06-27T09:43:00Z") // Ingest clock verification timestamp
    }
  ],
  "createdAt": ISODate("2026-06-27T09:43:00Z"), // Transaction initialization lifecycle birth timestamp
  "updatedAt": ISODate("2026-06-27T09:43:00Z")  // Final runtime database commit update execution timestamp
}


db.mdm_user_lifecycle_requests.createIndex({ "requestId": 1 }, { unique: true });
db.mdm_user_lifecycle_requests.createIndex({ "tenantId": 1, "targetUserId": 1 });
db.mdm_user_lifecycle_requests.createIndex({ "requestStatus": 1 }); // Optimizes pending administrative verification queues
