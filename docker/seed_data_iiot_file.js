// ============================================
// Adavis IIOT Seed Data (Pharma-Oriented)
// Expanded Hierarchy: 3 Plants × 4 Blocks × 3 Areas × 5 Rooms = 180 Equipment
// ============================================

// Connection retry logic
function connectWithRetry(maxRetries, delayMs) {
    maxRetries = maxRetries || 10;
    delayMs = delayMs || 2000;
    
    for (var i = 0; i < maxRetries; i++) {
        try {
            print("[IIOT-SEED] Attempting to connect to MongoDB (attempt " + (i + 1) + "/" + maxRetries + ")");
            var result = db.runCommand({ping: 1});
            if (result.ok === 1) {
                print("[IIOT-SEED] MongoDB connection SUCCESSFUL");
                return true;
            }
        } catch (e) {
            print("[IIOT-SEED] Connection attempt " + (i + 1) + " failed: " + e.message);
            if (i < maxRetries - 1) {
                print("[IIOT-SEED] Retrying in " + (delayMs/1000) + " seconds...");
                sleep(delayMs);
            }
        }
    }
    print("[IIOT-SEED] ERROR: Could not connect to MongoDB after " + maxRetries + " attempts");
    return false;
}

// Try to connect with retry
if (!connectWithRetry(10, 3000)) {
    print("[IIOT-SEED] FATAL: MongoDB connection failed. Exiting.");
    quit(1);
}

var databaseName = "adavis_platform";
if (typeof process !== "undefined" && process.env && process.env.MONGO_INITDB_DATABASE) {
    databaseName = process.env.MONGO_INITDB_DATABASE;
}

// Switch to the database
try {
    db = db.getSiblingDB(databaseName);
    print("[IIOT-SEED] Using database: " + databaseName);
} catch (e) {
    print("[IIOT-SEED] ERROR: Failed to switch to database: " + e.message);
    quit(1);
}

var TENANT_ID = "TNT-0001";

// ============================================
// EXPANDED HIERARCHY CONFIGURATION
// ============================================
// 3 Plants × 4 Blocks × 3 Areas × 5 Rooms = 180 Equipment
// Plant IDs: PLNT-0001 to PLNT-0003
// Block IDs per Plant: BLK-0001 to BLK-0004
// Area IDs per Block: AREA-0001 to AREA-0003
// Room IDs per Area: ROOM-0001 to ROOM-0005

var PLANT_IDS = ["PLNT-0001", "PLNT-0002", "PLNT-0003"];
var BLOCK_IDS = ["BLK-0001", "BLK-0002", "BLK-0003", "BLK-0004"];
var AREA_IDS = ["AREA-0001", "AREA-0002", "AREA-0003"];
var ROOM_IDS = ["ROOM-0001", "ROOM-0002", "ROOM-0003", "ROOM-0004", "ROOM-0005"];

// Calculate total equipment
var TOTAL_EQUIPMENT = PLANT_IDS.length * BLOCK_IDS.length * AREA_IDS.length * ROOM_IDS.length;
var EQUIPMENT_COUNT = TOTAL_EQUIPMENT; // 180 equipment

// Data generation parameters (reduced for performance)
var BATCHES_PER_EQUIPMENT = 2; // Reduced for performance with 180 equipment
var CPP_POINTS_PER_BATCH = 4; // Reduced for performance
var ALARMS_PER_BATCH = 2;

// Track equipment types for variety
var EQUIPMENT_TYPES = [
    "RMG", // Rapid Mixer Granulator
    "FBD", // Fluid Bed Dryer
    "Comill", // Comill
    "Blender", // Blender
    "Compression" // Compression Machine
];

var MAKES = [
    "SKPharma",
    "Apex Pharma Tech", 
    "GEA Group",
    "Glatt",
    "Bohle"
];

function logInfo(msg) {
    print("[IIOT-SEED] " + msg);
}

function now() {
    return new Date();
}

function ensureCollection(name) {
    try {
        var collections = db.getCollectionNames();
        if (collections.indexOf(name) === -1) {
            db.createCollection(name);
            logInfo("Created collection: " + name);
        }
        return true;
    } catch (e) {
        logInfo("ERROR creating collection " + name + ": " + e.message);
        return false;
    }
}

function resetCollection(name) {
    if (ensureCollection(name)) {
        try {
            var result = db.getCollection(name).deleteMany({});
            logInfo("Cleared collection: " + name + " (removed " + result.deletedCount + " documents)");
            return true;
        } catch (e) {
            logInfo("ERROR clearing collection " + name + ": " + e.message);
            return false;
        }
    }
    return false;
}

function upsertMany(collectionName, docs, keyField) {
    if (!docs || docs.length === 0) return;
    
    try {
        var col = db.getCollection(collectionName);
        var ops = [];
        docs.forEach(function (doc) {
            var filter = {};
            filter[keyField] = doc[keyField];
            ops.push({
                updateOne: {
                    filter: filter,
                    update: { $set: doc },
                    upsert: true
                }
            });
            // Batch operations to avoid memory issues
            if (ops.length >= 500) {
                col.bulkWrite(ops, { ordered: false });
                ops = [];
            }
        });
        if (ops.length > 0) {
            col.bulkWrite(ops, { ordered: false });
        }
        logInfo("Upserted " + docs.length + " docs into " + collectionName);
    } catch (e) {
        logInfo("ERROR upserting into " + collectionName + ": " + e.message);
    }
}

function pad2(value) {
    return (value < 10 ? "0" : "") + value;
}

function pad3(value) {
    return (value < 100 ? "0" + pad2(value) : "" + value);
}

function toIsoDate(value) {
    return ISODate(value.toISOString());
}

function addMinutes(base, minutes) {
    return new Date(base.getTime() + minutes * 60000);
}

function createEquipmentDefinitions() {
    var defs = [];
    var equipmentCounter = 0;
    
    PLANT_IDS.forEach(function(plantId, plantIndex) {
        BLOCK_IDS.forEach(function(blockId, blockIndex) {
            AREA_IDS.forEach(function(areaId, areaIndex) {
                ROOM_IDS.forEach(function(roomId, roomIndex) {
                    equipmentCounter++;
                    var eqIdx = equipmentCounter;
                    
                    // Variety in equipment naming
                    var eqTypeIndex = (eqIdx - 1) % EQUIPMENT_TYPES.length;
                    var eqType = EQUIPMENT_TYPES[eqTypeIndex];
                    var makeIndex = (eqIdx - 1) % MAKES.length;
                    var make = MAKES[makeIndex];
                    
                    var codePart = eqType + "-" + pad3(eqIdx);
                    var equipmentCode = eqType + pad3(eqIdx) + "PVII";
                    
                    defs.push({
                        equipmentId: codePart + "-PVII",
                        equipmentCode: equipmentCode,
                        equipmentName: eqType + " #" + eqIdx + " (" + make + ")",
                        plantId: plantId,
                        blockId: blockId,
                        areaId: areaId,
                        roomId: roomId,
                        make: make,
                        model: eqType + "-" + pad2((eqIdx % 10) + 1) + "00",
                        equipmentType: eqType,
                        hierarchy: {
                            plant: plantId,
                            block: blockId,
                            area: areaId,
                            room: roomId,
                            level: "EQUIPMENT",
                            fullPath: plantId + "/" + blockId + "/" + areaId + "/" + roomId + "/" + equipmentCode
                        },
                        plantIndex: plantIndex + 1,
                        blockIndex: blockIndex + 1,
                        areaIndex: areaIndex + 1,
                        roomIndex: roomIndex + 1,
                        // Additional metadata
                        equipmentIndex: eqIdx,
                        totalEquipment: TOTAL_EQUIPMENT
                    });
                });
            });
        });
    });
    
    logInfo("Created " + defs.length + " equipment definitions");
    return defs;
}

var EQUIPMENT_DEFS = createEquipmentDefinitions();

function getTimeSeriesCppCollection(equipmentId) {
    return "iiot_ts_cpp_tnt_0001_" + equipmentId.toLowerCase().replace(/[^a-z0-9]+/g, "_");
}

function getTimeSeriesAlarmCollection(equipmentId) {
    return "iiot_ts_alarm_event_tnt_0001_" + equipmentId.toLowerCase().replace(/[^a-z0-9]+/g, "_");
}

function getTimeSeriesCollections() {
    var names = [];
    EQUIPMENT_DEFS.forEach(function (eq) {
        names.push(getTimeSeriesCppCollection(eq.equipmentId));
        names.push(getTimeSeriesAlarmCollection(eq.equipmentId));
    });
    return names;
}

function createIndexes() {
    logInfo("Creating indexes...");
    try {
        // Master collections indexes
        db.iiot_equiment_master.createIndex({ tenantId: 1, equipmentId: 1 }, { unique: true, name: "ux_eq_tenant_equipment" });
        db.iiot_equiment_master.createIndex({ plantId: 1, blockId: 1, areaId: 1, roomId: 1 }, { name: "ix_eq_hierarchy" });
        db.iiot_equiment_master.createIndex({ plantId: 1, blockId: 1 }, { name: "ix_eq_plant_block" });
        db.iiot_equiment_master.createIndex({ equipmentType: 1 }, { name: "ix_eq_type" });
        db.iiot_equiment_master.createIndex({ make: 1 }, { name: "ix_eq_make" });
        
        db.iiot_equipment_critical_parameters.createIndex(
            { tenantId: 1, equipmentId: 1, parameterId: 1 },
            { unique: true, name: "ux_param_tenant_equipment_param" }
        );
        
        db.iiot_equipment_critical_parameters_limit.createIndex(
            { tenantId: 1, equipmentId: 1, parameterId: 1, effectiveFrom: -1 },
            { name: "ix_limit_lookup" }
        );
        
        db.iiot_product_master.createIndex({ tenantId: 1, productId: 1 }, { unique: true, name: "ux_product_tenant_product" });
        
        db.iiot_source_table_mapping.createIndex({ tenantId: 1, equipmentId: 1 }, { unique: true, name: "ux_mapping_tenant_equipment" });
        db.iiot_source_table_mapping.createIndex({ "batchSource.tableName": 1 }, { name: "ix_mapping_source_table" });
        
        db.iiot_ingestion_checkpoint.createIndex(
            { tenantId: 1, equipmentId: 1, streamType: 1 },
            { unique: true, name: "ux_checkpoint_stream" }
        );
        db.iiot_ingestion_checkpoint.createIndex({ status: 1, updatedAt: -1 }, { name: "ix_checkpoint_status" });
        
        db.iiot_ingestion_job_run.createIndex({ tenantId: 1, equipmentId: 1, startedAt: -1 }, { name: "ix_jobrun_latest" });
        db.iiot_ingestion_job_run.createIndex({ status: 1, startedAt: -1 }, { name: "ix_jobrun_status" });
        
        db.iiot_equipment_live_status.createIndex(
            { tenantId: 1, equipmentId: 1 },
            { unique: true, name: "ux_live_status_tenant_equipment" }
        );
        db.iiot_equipment_live_status.createIndex({ plantId: 1, blockId: 1 }, { name: "ix_live_status_hierarchy" });
        
        db.iiot_batch_summary.createIndex(
            { tenantId: 1, plantId: 1, areaId: 1, equipmentId: 1, batchNo: 1 },
            { unique: true, name: "ux_batch_summary_lookup" }
        );
        db.iiot_batch_summary.createIndex({ plantId: 1, blockId: 1, areaId: 1 }, { name: "ix_batch_summary_hierarchy" });
        db.iiot_batch_summary.createIndex({ batchStatus: 1, batchStartAt: -1 }, { name: "ix_batch_summary_status" });

        // Time series indexes for each equipment (limited to first 20 to save time)
        var maxIndexed = Math.min(EQUIPMENT_DEFS.length, 20);
        logInfo("Creating time-series indexes for first " + maxIndexed + " equipment...");
        
        for (var i = 0; i < maxIndexed; i++) {
            var eq = EQUIPMENT_DEFS[i];
            var cppCollection = getTimeSeriesCppCollection(eq.equipmentId);
            var alarmCollection = getTimeSeriesAlarmCollection(eq.equipmentId);

            db.getCollection(cppCollection).createIndex(
                { "meta.tenantId": 1, "meta.equipmentId": 1, observedAt: -1 },
                { name: "ix_cpp_meta_time" }
            );
            db.getCollection(cppCollection).createIndex(
                { "meta.plantId": 1, "meta.blockId": 1, "meta.areaId": 1, "meta.roomId": 1, observedAt: -1 },
                { name: "ix_cpp_hierarchy_time" }
            );
            db.getCollection(cppCollection).createIndex(
                { "meta.batchNo": 1, observedAt: 1 },
                { name: "ix_cpp_batch_time" }
            );
            db.getCollection(cppCollection).createIndex(
                { "source.tableName": 1, "source.sourceSeqId": 1 },
                { unique: true, name: "ux_cpp_source_seq" }
            );

            db.getCollection(alarmCollection).createIndex(
                { "meta.tenantId": 1, "meta.equipmentId": 1, eventAt: -1 },
                { name: "ix_alarm_meta_time" }
            );
            db.getCollection(alarmCollection).createIndex(
                { "meta.plantId": 1, "meta.blockId": 1, "meta.areaId": 1, "meta.roomId": 1, eventAt: -1 },
                { name: "ix_alarm_hierarchy_time" }
            );
            db.getCollection(alarmCollection).createIndex(
                { "meta.batchNo": 1, "event.eventCategory": 1, eventAt: 1 },
                { name: "ix_alarm_batch_category_time" }
            );
            db.getCollection(alarmCollection).createIndex(
                { "source.tableName": 1, "source.sourceSeqId": 1, "event.eventCode": 1 },
                { unique: true, name: "ux_alarm_source_seq_event" }
            );
            
            if (i % 10 === 0 && i > 0) {
                logInfo("  Created indexes for " + i + " equipment");
            }
        }
        
        logInfo("Indexes created successfully for " + maxIndexed + " equipment");
    } catch (e) {
        logInfo("ERROR creating indexes: " + e.message);
    }
}

function getProductCatalog(ts) {
    return [
        {
            productId: "PROD-TRM-50",
            productCode: "TRM50",
            productName: "TRAMODOL HCL TABLETS 50MG",
            tenantId: TENANT_ID,
            plantId: "PLNT-0001",
            isActive: true,
            createdAt: ts,
            updatedAt: ts
        },
        {
            productId: "PROD-IMI-25",
            productCode: "IMI25",
            productName: "IMIPRAMINE 25 MG TABLETS",
            tenantId: TENANT_ID,
            plantId: "PLNT-0001",
            isActive: true,
            createdAt: ts,
            updatedAt: ts
        },
        {
            productId: "PROD-MTF-500",
            productCode: "MTF500",
            productName: "METFORMIN HYDROCHLORIDE 500MG",
            tenantId: TENANT_ID,
            plantId: "PLNT-0002",
            isActive: true,
            createdAt: ts,
            updatedAt: ts
        },
        {
            productId: "PROD-AMX-250",
            productCode: "AMX250",
            productName: "AMOXICILLIN 250MG CAPSULES",
            tenantId: TENANT_ID,
            plantId: "PLNT-0002",
            isActive: true,
            createdAt: ts,
            updatedAt: ts
        },
        {
            productId: "PROD-ATV-20",
            productCode: "ATV20",
            productName: "ATORVASTATIN 20MG TABLETS",
            tenantId: TENANT_ID,
            plantId: "PLNT-0003",
            isActive: true,
            createdAt: ts,
            updatedAt: ts
        },
        {
            productId: "PROD-OMZ-40",
            productCode: "OMZ40",
            productName: "OMEPRAZOLE 40MG CAPSULES",
            tenantId: TENANT_ID,
            plantId: "PLNT-0003",
            isActive: true,
            createdAt: ts,
            updatedAt: ts
        },
        {
            productId: "PROD-LIS-10",
            productCode: "LIS10",
            productName: "LISINOPRIL 10MG TABLETS",
            tenantId: TENANT_ID,
            plantId: "PLNT-0001",
            isActive: true,
            createdAt: ts,
            updatedAt: ts
        },
        {
            productId: "PROD-LEV-500",
            productCode: "LEV500",
            productName: "LEVOFLOXACIN 500MG TABLETS",
            tenantId: TENANT_ID,
            plantId: "PLNT-0002",
            isActive: true,
            createdAt: ts,
            updatedAt: ts
        }
    ];
}

function buildParameterDocs(equipmentId, equipmentIndex, ts) {
    // Different parameter sets based on equipment type
    var eqType = EQUIPMENT_TYPES[(equipmentIndex - 1) % EQUIPMENT_TYPES.length];
    var parameters = [];
    
    // Base parameters for all equipment
    parameters.push(
        {
            suffix: "TEMP",
            code: "temperature",
            name: "Temperature",
            parameterType: "FLOAT",
            unitOfMeasure: "celsius",
            isCritical: true
        },
        {
            suffix: "PRESS",
            code: "pressure",
            name: "Pressure",
            parameterType: "FLOAT",
            unitOfMeasure: "bar",
            isCritical: true
        }
    );
    
    // Equipment-specific parameters
    if (eqType === "RMG") {
        parameters.push(
            {
                suffix: "IMP",
                code: "impellerSpeed",
                name: "Impeller Speed",
                parameterType: "FLOAT",
                unitOfMeasure: "rpm",
                isCritical: true
            },
            {
                suffix: "CHOP",
                code: "chopperSpeed",
                name: "Chopper Speed",
                parameterType: "FLOAT",
                unitOfMeasure: "rpm",
                isCritical: true
            }
        );
    } else if (eqType === "FBD") {
        parameters.push(
            {
                suffix: "AIR",
                code: "airFlow",
                name: "Air Flow",
                parameterType: "FLOAT",
                unitOfMeasure: "m3/hr",
                isCritical: true
            },
            {
                suffix: "INLET",
                code: "inletTemp",
                name: "Inlet Temperature",
                parameterType: "FLOAT",
                unitOfMeasure: "celsius",
                isCritical: true
            }
        );
    } else if (eqType === "Comill") {
        parameters.push(
            {
                suffix: "RPM",
                code: "impellerRPM",
                name: "Impeller RPM",
                parameterType: "FLOAT",
                unitOfMeasure: "rpm",
                isCritical: true
            },
            {
                suffix: "FEED",
                code: "feedRate",
                name: "Feed Rate",
                parameterType: "FLOAT",
                unitOfMeasure: "kg/hr",
                isCritical: false
            }
        );
    } else if (eqType === "Blender") {
        parameters.push(
            {
                suffix: "ROT",
                code: "rotationSpeed",
                name: "Rotation Speed",
                parameterType: "FLOAT",
                unitOfMeasure: "rpm",
                isCritical: true
            },
            {
                suffix: "TIME",
                code: "blendTime",
                name: "Blend Time",
                parameterType: "FLOAT",
                unitOfMeasure: "minutes",
                isCritical: true
            }
        );
    } else if (eqType === "Compression") {
        parameters.push(
            {
                suffix: "FORCE",
                code: "compressionForce",
                name: "Compression Force",
                parameterType: "FLOAT",
                unitOfMeasure: "kN",
                isCritical: true
            },
            {
                suffix: "SPEED",
                code: "turretSpeed",
                name: "Turret Speed",
                parameterType: "FLOAT",
                unitOfMeasure: "rpm",
                isCritical: true
            }
        );
    }

    var paramDocs = [];
    var limitDocs = [];

    parameters.forEach(function (p, idx) {
        var parameterId = "PRM-" + p.suffix + "-" + pad3(equipmentIndex);
        var parameterLimitId = "LMT-" + p.suffix + "-" + pad3(equipmentIndex) + "-20260101";
        var base = 6.0 + (equipmentIndex % 10) * 0.2 + idx * 0.35;

        paramDocs.push({
            parameterSeqId: 50000 + equipmentIndex * 10 + idx,
            tenantId: TENANT_ID,
            equipmentId: equipmentId,
            parameterId: parameterId,
            parameterCode: p.code,
            parameterName: p.name,
            parameterType: p.parameterType,
            unitOfMeasure: p.unitOfMeasure,
            isCritical: p.isCritical,
            isActive: true,
            createdAt: ts,
            updatedAt: ts
        });

        limitDocs.push({
            parameterLimitId: parameterLimitId,
            parameterLimitSeqId: 90000 + equipmentIndex * 10 + idx,
            tenantId: TENANT_ID,
            equipmentId: equipmentId,
            parameterId: parameterId,
            lowCriticalValue: Number((base - 1.0).toFixed(2)),
            lowWarningValue: Number((base - 0.6).toFixed(2)),
            idealMinValue: Number((base - 0.2).toFixed(2)),
            idealMaxValue: Number((base + 0.25).toFixed(2)),
            highWarningValue: Number((base + 0.6).toFixed(2)),
            highCriticalValue: Number((base + 1.0).toFixed(2)),
            alarmEnabled: true,
            effectiveFrom: ISODate("2026-01-01T00:00:00Z"),
            effectiveTo: null,
            isActive: true,
            createdAt: ts,
            updatedAt: ts
        });
    });

    return { params: paramDocs, limits: limitDocs, parameterCount: parameters.length };
}

function seedMasterData() {
    logInfo("Seeding master data for " + EQUIPMENT_DEFS.length + " equipment...");
    try {
        var ts = now();
        var equipmentDocs = [];
        var parameterDocs = [];
        var parameterLimitDocs = [];
        var sourceMappings = [];
        var productDocs = getProductCatalog(ts);

        var batchSize = 50;
        var totalProcessed = 0;

        EQUIPMENT_DEFS.forEach(function (eq, index) {
            equipmentDocs.push({
                equipmentSeqId: 10000 + index + 1,
                tenantId: TENANT_ID,
                plantId: eq.plantId,
                blockId: eq.blockId,
                areaId: eq.areaId,
                roomId: eq.roomId,
                equipmentId: eq.equipmentId,
                equipmentCode: eq.equipmentCode,
                equipmentName: eq.equipmentName,
                equipmentType: eq.equipmentType,
                make: eq.make,
                model: eq.model,
                isActive: true,
                isDeleted: false,
                createdAt: ts,
                updatedAt: ts,
                hierarchy: eq.hierarchy
            });

            var paramPayload = buildParameterDocs(eq.equipmentId, index + 1, ts);
            parameterDocs = parameterDocs.concat(paramPayload.params);
            parameterLimitDocs = parameterLimitDocs.concat(paramPayload.limits);

            sourceMappings.push({
                mappingId: "MAP-" + TENANT_ID + "-" + eq.equipmentCode,
                tenantId: TENANT_ID,
                equipmentId: eq.equipmentId,
                batchSource: {
                    dbType: "SAP_HANA",
                    schemaName: "SKPharma",
                    tableName: "SKPharma::CDSSKPharma.B_UDA_" + eq.equipmentCode,
                    sequenceColumn: "SerialNumber",
                    timestampColumn: "LastModifiedTime"
                },
                alarmEventSource: {
                    dbType: "SAP_HANA",
                    schemaName: "SKPharma",
                    tableName: "SKPharma::CDSSKPharma.AE_" + eq.equipmentCode,
                    sequenceColumn: "id",
                    timestampColumn: "LastModifiedTime"
                },
                pollIntervalSeconds: 30,
                batchSize: 1000,
                connectionRef: "SAP-HANA-DEV-01",
                validationStatus: "SUCCESS",
                lastValidatedAt: ts,
                isActive: true,
                updatedAt: ts,
                hierarchy: eq.hierarchy
            });

            totalProcessed++;
            
            // Log progress
            if (totalProcessed % batchSize === 0 || totalProcessed === EQUIPMENT_DEFS.length) {
                logInfo("  Processed " + totalProcessed + "/" + EQUIPMENT_DEFS.length + " equipment");
            }
        });

        // Insert in batches
        upsertMany("iiot_equiment_master", equipmentDocs, "equipmentId");
        upsertMany("iiot_product_master", productDocs, "productId");
        upsertMany("iiot_equipment_critical_parameters", parameterDocs, "parameterId");
        upsertMany("iiot_equipment_critical_parameters_limit", parameterLimitDocs, "parameterLimitId");
        upsertMany("iiot_source_table_mapping", sourceMappings, "mappingId");
        
        logInfo("Master data seeded for " + equipmentDocs.length + " equipment");
        logInfo("  Parameters created: " + parameterDocs.length);
        logInfo("  Limits created: " + parameterLimitDocs.length);
        logInfo("  Mappings created: " + sourceMappings.length);
    } catch (e) {
        logInfo("ERROR in seedMasterData: " + e.message);
    }
}

function seedIngestionData() {
    logInfo("Seeding ingestion data for " + EQUIPMENT_DEFS.length + " equipment...");
    try {
        var allProducts = db.iiot_product_master.find({ tenantId: TENANT_ID, isActive: true }).toArray();
        if (allProducts.length === 0) {
            logInfo("WARNING: No products found. Skipping ingestion data.");
            return;
        }
        
        var baseDate = new Date("2026-07-01T00:00:00Z");

        var checkpointDocs = [];
        var jobRunDocs = [];
        var batchSummaryDocs = [];

        // Process equipment in batches
        var maxEquipment = Math.min(EQUIPMENT_DEFS.length, 30); // Process first 30 for performance
        var batchSize = 10;
        logInfo("Processing " + maxEquipment + " equipment (out of " + EQUIPMENT_DEFS.length + ")");

        for (var eqIdx = 0; eqIdx < maxEquipment; eqIdx++) {
            var eq = EQUIPMENT_DEFS[eqIdx];
            
            if (eqIdx % batchSize === 0 && eqIdx > 0) {
                logInfo("  Processing equipment " + (eqIdx) + "/" + maxEquipment);
            }
            
            var cppCollection = getTimeSeriesCppCollection(eq.equipmentId);
            var alarmCollection = getTimeSeriesAlarmCollection(eq.equipmentId);

            var cppDocs = [];
            var alarmEventDocs = [];
            var latestCpp = null;

            var cppSeq = 100000 + eqIdx * 10000;
            var alarmSeq = 200000 + eqIdx * 10000;

            for (var batchIdx = 1; batchIdx <= BATCHES_PER_EQUIPMENT; batchIdx++) {
                var product = allProducts[(eqIdx + batchIdx) % allProducts.length];
                var batchNo = "B" + pad2(eqIdx + 1) + "-2026-" + pad2(batchIdx);
                var lotNo = "L" + pad2(batchIdx) + "-" + pad2(eqIdx + 1);
                var batchStart = addMinutes(baseDate, eqIdx * 45 + batchIdx * 25);
                var operatorName = batchIdx % 2 === 0 ? "RAJESH" : "SURESH";

                for (var pointIdx = 0; pointIdx < CPP_POINTS_PER_BATCH; pointIdx++) {
                    cppSeq += 1;
                    var observedAt = addMinutes(batchStart, pointIdx * 2);
                    
                    // Generate equipment-specific metrics
                    var eqType = eq.equipmentType;
                    var metrics = {};
                    
                    if (eqType === "RMG") {
                        metrics = {
                            temperature: Number((25.0 + (eqIdx % 5) * 0.5 + (pointIdx % 3) * 0.3).toFixed(2)),
                            pressure: Number((1.0 + (eqIdx % 3) * 0.1 + (pointIdx % 2) * 0.05).toFixed(2)),
                            impellerSpeed: Number((150.0 + (eqIdx % 10) * 5.0 + (pointIdx % 4) * 2.0).toFixed(2)),
                            chopperSpeed: Number((3000.0 + (eqIdx % 8) * 100.0 + (pointIdx % 3) * 50.0).toFixed(2))
                        };
                    } else if (eqType === "FBD") {
                        metrics = {
                            temperature: Number((45.0 + (eqIdx % 5) * 1.0 + (pointIdx % 3) * 0.5).toFixed(2)),
                            pressure: Number((0.5 + (eqIdx % 3) * 0.1 + (pointIdx % 2) * 0.03).toFixed(2)),
                            airFlow: Number((500.0 + (eqIdx % 8) * 25.0 + (pointIdx % 3) * 10.0).toFixed(2)),
                            inletTemp: Number((70.0 + (eqIdx % 5) * 2.0 + (pointIdx % 3) * 1.0).toFixed(2))
                        };
                    } else if (eqType === "Comill") {
                        metrics = {
                            temperature: Number((22.0 + (eqIdx % 4) * 0.5 + (pointIdx % 3) * 0.2).toFixed(2)),
                            pressure: Number((0.8 + (eqIdx % 3) * 0.1 + (pointIdx % 2) * 0.04).toFixed(2)),
                            impellerRPM: Number((2000.0 + (eqIdx % 12) * 100.0 + (pointIdx % 4) * 50.0).toFixed(2)),
                            feedRate: Number((50.0 + (eqIdx % 6) * 5.0 + (pointIdx % 3) * 2.0).toFixed(2))
                        };
                    } else if (eqType === "Blender") {
                        metrics = {
                            temperature: Number((20.0 + (eqIdx % 4) * 0.5 + (pointIdx % 3) * 0.2).toFixed(2)),
                            pressure: Number((0.3 + (eqIdx % 3) * 0.1 + (pointIdx % 2) * 0.02).toFixed(2)),
                            rotationSpeed: Number((20.0 + (eqIdx % 6) * 2.0 + (pointIdx % 3) * 1.0).toFixed(2)),
                            blendTime: Number((15.0 + (eqIdx % 5) * 2.0 + (pointIdx % 4) * 0.5).toFixed(2))
                        };
                    } else if (eqType === "Compression") {
                        metrics = {
                            temperature: Number((28.0 + (eqIdx % 4) * 0.5 + (pointIdx % 3) * 0.2).toFixed(2)),
                            pressure: Number((2.0 + (eqIdx % 5) * 0.2 + (pointIdx % 3) * 0.1).toFixed(2)),
                            compressionForce: Number((15.0 + (eqIdx % 8) * 1.0 + (pointIdx % 4) * 0.5).toFixed(2)),
                            turretSpeed: Number((30.0 + (eqIdx % 6) * 2.0 + (pointIdx % 3) * 1.0).toFixed(2))
                        };
                    }

                    var cppDoc = {
                        observedAt: toIsoDate(observedAt),
                        meta: {
                            tenantId: TENANT_ID,
                            equipmentId: eq.equipmentId,
                            plantId: eq.plantId,
                            blockId: eq.blockId,
                            areaId: eq.areaId,
                            roomId: eq.roomId,
                            batchNo: batchNo,
                            lotNo: lotNo,
                            productName: product.productName,
                            operatorName: operatorName,
                            equipmentType: eq.equipmentType,
                            status: pointIdx < CPP_POINTS_PER_BATCH - 1 ? "RUNNING" : "STOP",
                            hierarchy: {
                                plant: eq.plantId,
                                block: eq.blockId,
                                area: eq.areaId,
                                room: eq.roomId,
                                fullPath: eq.hierarchy.fullPath
                            }
                        },
                        source: {
                            tableName: "SKPharma::CDSSKPharma.B_UDA_" + eq.equipmentCode,
                            sourceSeqId: cppSeq,
                            lastModifiedTime: toIsoDate(observedAt),
                            machineDate: observedAt.toISOString().slice(0, 19).replace("T", " ")
                        },
                        metrics: metrics,
                        ingestedAt: now()
                    };

                    cppDocs.push(cppDoc);
                    latestCpp = cppDoc;
                }

                for (var alarmIdx = 0; alarmIdx < ALARMS_PER_BATCH; alarmIdx++) {
                    alarmSeq += 1;
                    var eventAt = addMinutes(batchStart, 3 + alarmIdx * 8);
                    var isAlarm = alarmIdx !== ALARMS_PER_BATCH - 1;
                    
                    var eventData = {
                        eventAt: toIsoDate(eventAt),
                        meta: {
                            tenantId: TENANT_ID,
                            equipmentId: eq.equipmentId,
                            plantId: eq.plantId,
                            blockId: eq.blockId,
                            areaId: eq.areaId,
                            roomId: eq.roomId,
                            batchNo: batchNo,
                            lotNo: lotNo,
                            productName: product.productName,
                            equipmentType: eq.equipmentType,
                            status: "RUNNING",
                            hierarchy: {
                                plant: eq.plantId,
                                block: eq.blockId,
                                area: eq.areaId,
                                room: eq.roomId,
                                fullPath: eq.hierarchy.fullPath
                            }
                        },
                        source: {
                            tableName: "SKPharma::CDSSKPharma.AE_" + eq.equipmentCode,
                            sourceSeqId: alarmSeq,
                            lastModifiedTime: toIsoDate(eventAt)
                        },
                        event: {
                            eventCategory: isAlarm ? "ALARM" : "EVENT",
                            eventCode: isAlarm ? (alarmIdx === 0 ? "TEMP_OVER_RANGE" : "PRESS_OVER_RANGE") : "BATCH_PHASE_CHANGE",
                            eventText: isAlarm ? (alarmIdx === 0 ? "Temperature above warning threshold" : "Pressure above warning threshold") : "Batch moved to next phase",
                            severity: isAlarm ? (alarmIdx === 0 ? "HIGH" : "MEDIUM") : "LOW",
                            eventState: isAlarm ? "OPEN" : "INFO"
                        },
                        ingestedAt: now()
                    };
                    
                    alarmEventDocs.push(eventData);
                }

                batchSummaryDocs.push({
                    tenantId: TENANT_ID,
                    equipmentId: eq.equipmentId,
                    batchNo: batchNo,
                    lotNo: lotNo,
                    productName: product.productName,
                    plantId: eq.plantId,
                    blockId: eq.blockId,
                    areaId: eq.areaId,
                    roomId: eq.roomId,
                    equipmentType: eq.equipmentType,
                    batchStartAt: toIsoDate(batchStart),
                    batchEndAt: toIsoDate(addMinutes(batchStart, (CPP_POINTS_PER_BATCH - 1) * 2)),
                    batchStatus: "COMPLETED",
                    cppRecordCount: CPP_POINTS_PER_BATCH,
                    alarmCount: ALARMS_PER_BATCH - 1,
                    eventCount: 1,
                    createdAt: now(),
                    updatedAt: now(),
                    hierarchy: {
                        plant: eq.plantId,
                        block: eq.blockId,
                        area: eq.areaId,
                        room: eq.roomId,
                        fullPath: eq.hierarchy.fullPath
                    }
                });
            }

            // Insert in batches
            if (cppDocs.length > 0) {
                try {
                    db.getCollection(cppCollection).insertMany(cppDocs, { ordered: false });
                    logInfo("  Inserted " + cppDocs.length + " CPP docs into " + cppCollection);
                } catch (e) {
                    logInfo("  Error inserting CPP docs: " + e.message);
                }
            }

            if (alarmEventDocs.length > 0) {
                try {
                    db.getCollection(alarmCollection).insertMany(alarmEventDocs, { ordered: false });
                    logInfo("  Inserted " + alarmEventDocs.length + " Alarm/Event docs into " + alarmCollection);
                } catch (e) {
                    logInfo("  Error inserting Alarm docs: " + e.message);
                }
            }

            checkpointDocs.push({
                checkpointId: "CP-" + TENANT_ID + "-" + eq.equipmentId + "-BATCH_CPP",
                tenantId: TENANT_ID,
                equipmentId: eq.equipmentId,
                streamType: "BATCH_CPP",
                sourceTable: "SKPharma::CDSSKPharma.B_UDA_" + eq.equipmentCode,
                lastProcessedSeqId: cppSeq,
                lastProcessedAt: now(),
                status: "SUCCESS",
                updatedAt: now(),
                hierarchy: {
                    plant: eq.plantId,
                    block: eq.blockId,
                    area: eq.areaId,
                    room: eq.roomId
                }
            });

            checkpointDocs.push({
                checkpointId: "CP-" + TENANT_ID + "-" + eq.equipmentId + "-ALARM_EVENT",
                tenantId: TENANT_ID,
                equipmentId: eq.equipmentId,
                streamType: "ALARM_EVENT",
                sourceTable: "SKPharma::CDSSKPharma.AE_" + eq.equipmentCode,
                lastProcessedSeqId: alarmSeq,
                lastProcessedAt: now(),
                status: "SUCCESS",
                updatedAt: now(),
                hierarchy: {
                    plant: eq.plantId,
                    block: eq.blockId,
                    area: eq.areaId,
                    room: eq.roomId
                }
            });

            jobRunDocs.push({
                jobRunId: "JOB-SEED-BATCH-" + pad3(eqIdx + 1),
                tenantId: TENANT_ID,
                equipmentId: eq.equipmentId,
                streamType: "BATCH_CPP",
                windowStartSeqId: cppSeq - (BATCHES_PER_EQUIPMENT * CPP_POINTS_PER_BATCH) + 1,
                windowEndSeqId: cppSeq,
                recordsRead: BATCHES_PER_EQUIPMENT * CPP_POINTS_PER_BATCH,
                recordsWritten: BATCHES_PER_EQUIPMENT * CPP_POINTS_PER_BATCH,
                recordsSkipped: 0,
                status: "SUCCESS",
                errorSummary: null,
                startedAt: toIsoDate(addMinutes(baseDate, eqIdx * 25)),
                completedAt: toIsoDate(addMinutes(baseDate, eqIdx * 25 + 4)),
                createdAt: now(),
                updatedAt: now(),
                hierarchy: {
                    plant: eq.plantId,
                    block: eq.blockId,
                    area: eq.areaId,
                    room: eq.roomId
                }
            });

            jobRunDocs.push({
                jobRunId: "JOB-SEED-ALARM-" + pad3(eqIdx + 1),
                tenantId: TENANT_ID,
                equipmentId: eq.equipmentId,
                streamType: "ALARM_EVENT",
                windowStartSeqId: alarmSeq - (BATCHES_PER_EQUIPMENT * ALARMS_PER_BATCH) + 1,
                windowEndSeqId: alarmSeq,
                recordsRead: BATCHES_PER_EQUIPMENT * ALARMS_PER_BATCH,
                recordsWritten: BATCHES_PER_EQUIPMENT * ALARMS_PER_BATCH,
                recordsSkipped: 0,
                status: "SUCCESS",
                errorSummary: null,
                startedAt: toIsoDate(addMinutes(baseDate, eqIdx * 25 + 6)),
                completedAt: toIsoDate(addMinutes(baseDate, eqIdx * 25 + 10)),
                createdAt: now(),
                updatedAt: now(),
                hierarchy: {
                    plant: eq.plantId,
                    block: eq.blockId,
                    area: eq.areaId,
                    room: eq.roomId
                }
            });

            if (latestCpp !== null) {
                db.iiot_equipment_live_status.updateOne(
                    { tenantId: TENANT_ID, equipmentId: eq.equipmentId },
                    {
                        $set: {
                            tenantId: TENANT_ID,
                            equipmentId: eq.equipmentId,
                            plantId: eq.plantId,
                            blockId: eq.blockId,
                            areaId: eq.areaId,
                            roomId: eq.roomId,
                            equipmentType: eq.equipmentType,
                            currentState: "RUNNING",
                            stateReason: latestCpp.metrics.temperature ? "Temperature: " + latestCpp.metrics.temperature + "°C" : "Running",
                            lastBatchNo: latestCpp.meta.batchNo,
                            lastLotNo: latestCpp.meta.lotNo,
                            lastSourceSeqId: latestCpp.source.sourceSeqId,
                            lastEventAt: latestCpp.observedAt,
                            heartbeatAt: now(),
                            updatedAt: now(),
                            hierarchy: {
                                plant: eq.plantId,
                                block: eq.blockId,
                                area: eq.areaId,
                                room: eq.roomId,
                                fullPath: eq.hierarchy.fullPath
                            }
                        },
                        $setOnInsert: { createdAt: now() }
                    },
                    { upsert: true }
                );
            }
        }

        if (checkpointDocs.length > 0) {
            try {
                db.iiot_ingestion_checkpoint.insertMany(checkpointDocs, { ordered: false });
                logInfo("Inserted checkpoints: " + checkpointDocs.length);
            } catch (e) {
                logInfo("Error inserting checkpoints: " + e.message);
            }
        }

        if (jobRunDocs.length > 0) {
            try {
                db.iiot_ingestion_job_run.insertMany(jobRunDocs, { ordered: false });
                logInfo("Inserted job runs: " + jobRunDocs.length);
            } catch (e) {
                logInfo("Error inserting job runs: " + e.message);
            }
        }

        if (batchSummaryDocs.length > 0) {
            try {
                db.iiot_batch_summary.insertMany(batchSummaryDocs, { ordered: false });
                logInfo("Inserted batch summaries: " + batchSummaryDocs.length);
            } catch (e) {
                logInfo("Error inserting batch summaries: " + e.message);
            }
        }
        
        logInfo("Ingestion data seeding completed!");
        logInfo("  Total CPP records inserted: " + (maxEquipment * BATCHES_PER_EQUIPMENT * CPP_POINTS_PER_BATCH));
        logInfo("  Total Alarm records inserted: " + (maxEquipment * BATCHES_PER_EQUIPMENT * ALARMS_PER_BATCH));
    } catch (e) {
        logInfo("ERROR in seedIngestionData: " + e.message);
    }
}

function validateHierarchy() {
    logInfo("=== HIERARCHY VALIDATION ===");
    logInfo("Total Equipment: " + EQUIPMENT_DEFS.length);
    logInfo("Expected: " + TOTAL_EQUIPMENT + " (" + PLANT_IDS.length + " Plants × " + BLOCK_IDS.length + " Blocks × " + AREA_IDS.length + " Areas × " + ROOM_IDS.length + " Rooms)");
    
    // Summary by plant
    logInfo("Equipment by Plant:");
    PLANT_IDS.forEach(function(plantId) {
        var plantEquip = EQUIPMENT_DEFS.filter(function(eq) { return eq.plantId === plantId; });
        logInfo("  " + plantId + ": " + plantEquip.length + " equipment");
        logInfo("    Expected: " + (BLOCK_IDS.length * AREA_IDS.length * ROOM_IDS.length));
    });
    
    // Summary by equipment type
    logInfo("Equipment by Type:");
    var typeCounts = {};
    EQUIPMENT_DEFS.forEach(function(eq) {
        if (!typeCounts[eq.equipmentType]) {
            typeCounts[eq.equipmentType] = 0;
        }
        typeCounts[eq.equipmentType]++;
    });
    for (var type in typeCounts) {
        logInfo("  " + type + ": " + typeCounts[type] + " equipment");
    }
    
    // Validate uniqueness
    var uniqueIds = {};
    var duplicates = [];
    EQUIPMENT_DEFS.forEach(function(eq) {
        if (uniqueIds[eq.equipmentId]) {
            duplicates.push(eq.equipmentId);
        }
        uniqueIds[eq.equipmentId] = true;
    });
    
    if (duplicates.length > 0) {
        logInfo("WARNING: Found duplicate equipment IDs: " + duplicates.join(", "));
    } else {
        logInfo("All equipment IDs are unique!");
    }
    
    // Validate hierarchy paths
    var hierarchyPaths = {};
    EQUIPMENT_DEFS.forEach(function(eq) {
        var path = eq.plantId + "/" + eq.blockId + "/" + eq.areaId + "/" + eq.roomId;
        if (!hierarchyPaths[path]) {
            hierarchyPaths[path] = [];
        }
        hierarchyPaths[path].push(eq.equipmentCode);
    });
    
    logInfo("Unique hierarchy paths: " + Object.keys(hierarchyPaths).length);
    var expectedPaths = PLANT_IDS.length * BLOCK_IDS.length * AREA_IDS.length * ROOM_IDS.length;
    logInfo("Expected unique paths: " + expectedPaths);
    
    logInfo("=== VALIDATION COMPLETE ===");
    return true;
}

function runSeed() {
    logInfo("=== STARTING IIOT SEED ===");
    logInfo("Configuration:");
    logInfo("  Plants: " + PLANT_IDS.length + " (" + PLANT_IDS.join(", ") + ")");
    logInfo("  Blocks per Plant: " + BLOCK_IDS.length + " (" + BLOCK_IDS.join(", ") + ")");
    logInfo("  Areas per Block: " + AREA_IDS.length + " (" + AREA_IDS.join(", ") + ")");
    logInfo("  Rooms per Area: " + ROOM_IDS.length + " (" + ROOM_IDS.join(", ") + ")");
    logInfo("  Total Equipment: " + TOTAL_EQUIPMENT);
    logInfo("  Batches per Equipment: " + BATCHES_PER_EQUIPMENT);
    logInfo("  CPP Points per Batch: " + CPP_POINTS_PER_BATCH);
    logInfo("  Alarms per Batch: " + ALARMS_PER_BATCH);
    logInfo("  Equipment Types: " + EQUIPMENT_TYPES.join(", "));
    
    try {
        // Validate hierarchy first
        validateHierarchy();
        
        var coreCollections = [
            "iiot_equiment_master",
            "iiot_equipment_critical_parameters",
            "iiot_equipment_critical_parameters_limit",
            "iiot_product_master",
            "iiot_source_table_mapping",
            "iiot_ingestion_checkpoint",
            "iiot_ingestion_job_run",
            "iiot_equipment_live_status",
            "iiot_batch_summary"
        ].concat(getTimeSeriesCollections());

        // Reset collections
        logInfo("Resetting collections...");
        var resetCount = 0;
        coreCollections.forEach(function (name) {
            if (resetCollection(name)) {
                resetCount++;
            }
        });
        logInfo("Reset " + resetCount + " collections");

        // Create indexes
        createIndexes();
        
        // Seed master data
        seedMasterData();
        
        // Seed ingestion data
        seedIngestionData();

        logInfo("=== SEED COMPLETED ===");
        logInfo("Database: " + databaseName);
        logInfo("Total Equipment Defined: " + EQUIPMENT_DEFS.length);
        logInfo("Total Batches (all equipment): " + (EQUIPMENT_DEFS.length * BATCHES_PER_EQUIPMENT));
        logInfo("Total CPP Records (all equipment): " + (EQUIPMENT_DEFS.length * BATCHES_PER_EQUIPMENT * CPP_POINTS_PER_BATCH));
        logInfo("Total Alarm Records (all equipment): " + (EQUIPMENT_DEFS.length * BATCHES_PER_EQUIPMENT * ALARMS_PER_BATCH));
        logInfo("Note: Only first 30 equipment have actual data inserted for performance");
        
        logInfo("Collection counts:");
        coreCollections.forEach(function (c) {
            try {
                var count = db.getCollection(c).countDocuments({});
                print(" - " + c + ": " + count);
            } catch (e) {
                print(" - " + c + ": ERROR (" + e.message + ")");
            }
        });
    } catch (e) {
        logInfo("FATAL ERROR in runSeed: " + e.message);
        logInfo("Stack trace: " + e.stack);
        quit(1);
    }
}

// Execute the seed
runSeed();

// Final status
print("[IIOT-SEED] Script execution completed.");
quit(0);