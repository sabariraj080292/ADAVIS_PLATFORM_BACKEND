{
  "_id": ObjectId("648c6a18a3b4e21a2c3d0019"), // Default MongoDB unique auto ID
  "tenantId": "TNT-0001",                       // Binds log visibility securely within the multi-tenant client fence
  "plantId": "PLNT-0001",                       // Physical facility context lock where the operation was executed
  "userId": "m_smith_admin",                    // References the username handle who performed the transaction
  
  // ========================================================
  // 🆕 GLOBALIZED ACTIVITY TRACKING MATRIX
  // ========================================================
  "action": "USER_CREATION",                    // [CRITICAL] Standardized upper-case business code tracking the exact event
  "module": "MOD-MDM",                          // Source module code identifying the system space (e.g., MOD-MDM, MOD-IIOT, MOD-DMS)
  
  // ========================================================
  // 🔄 FLEXIBLE SNAPSHOT CONTEXT PAYLOAD
  // ========================================================
  "payload": {                                  // Polymorphic object storing old and new states based on the specific action
    "targetRecordId": "jdoe_qa",                // The business code or unique identifier of the target asset being modified
    "beforeState": null,                        // Entire JSON snapshot of the object before change (null for creation events)
    "afterState": {                             // Entire JSON snapshot of the object after the modification took place
      "userId": "jdoe_qa",
      "userTrackId": "USR-0001",
      "lifecycleStatus": "ACTIVE",
      "title": "Senior Quality Assurance Specialist"
    }
  },
  
  // ========================================================
  // 🔐 HARDWARE TELEMETRY & PHYSICAL AUDIT TRAIL
  // ========================================================
  "networkProfile": {
    "ipAddress": "10.140.22.8",                 // Terminal IP address mapping the event origin location
    "userAgent": "Mozilla/5.0 Windows"            // Workstation browser configuration signature profiling
  },
  "changeReason": "Onboarded new Quality Assurance employee via signed physical paper validation form", // Human justification text
  "timestamp": ISODate("2026-06-27T11:50:00Z")  // Unyielding database server clock timestamp entry
}


// Accelerates searching for specific actions inside a plant (e.g., pulling all PASSWORD_RESET logs)
db.audit_trails.createIndex({ "tenantId": 1, "plantId": 1, "action": 1, "timestamp": -1 });

// Accelerates pulling a single employee's full chronological activity timeline
db.audit_trails.createIndex({ "tenantId": 1, "userId": 1, "timestamp": -1 });
