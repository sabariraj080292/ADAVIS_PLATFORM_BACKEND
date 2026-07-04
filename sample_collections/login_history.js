{
  "_id": ObjectId("648c6a19a3b4e21a2c3d001a"), // Default MongoDB unique auto ID
  "tenantId": "TNT-0001",                       // Binds authentication tracking within a specific multi-tenant customer fence
  "userId": "jdoe_qa",                          // References the unique username handle entered by the actor (null if username doesn't exist)
  "usernameEntered": "jdoe_qa",                 // The raw text input entered in the login form (Essential for parsing malicious scanning attempts)
  "status": "SUCCESS",                          // The definitive auth state: SUCCESS, FAILED_CREDENTIALS, LOCKED_BY_POLICY, MFA_REJECTED
  "failureReason": null,                        // Text description matching lookup constants: "Invalid Password Signature", "Account Suspended"
  
  // ========================================================
  // 🔐 HARDWARE TELEMETRY & NETWORK PROFILE
  // ========================================================
  "networkProfile": {
    "ipAddress": "192.168.10.45",               // Source network terminal IP address mapping the authentication query location
    "userAgent": "Mozilla/5.0 Chrome/126.0",    // Workstation browser configuration profiling telemetry signature
    "locationContext": "Rensselaer On-Site Network Floor-Zone 3" // Mapped physical cleanroom segment or VPN connection node
  },
  
  "timestamp": ISODate("2026-06-27T11:59:00Z")  // Unyielding server clock timestamp checking validation timelines
}

db.login_history.createIndex({ "tenantId": 1, "userId": 1, "timestamp": -1 });
db.login_history.createIndex({ "tenantId": 1, "status": 1, "timestamp": -1 }); // Optimizes live security audit panels tracking failures
