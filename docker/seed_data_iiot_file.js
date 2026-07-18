// ============================================
// Adavis IIOT Seed Data (Pharma-Oriented)
// EXPANDED Hierarchy: 3 Plants × 4 Blocks × 3 Areas × 5 Rooms = 180 Equipment
// OPTIMIZED for performance with large datasets
// ============================================

// Connection test - simple and fast
try {
    var testResult = db.runCommand({ping: 1});
    if (testResult.ok !== 1) {
        print("[IIOT-SEED] ERROR: Cannot connect to MongoDB");
        quit(1);
    }
} catch (e) {
    print("[IIOT-SEED] ERROR: MongoDB connection failed: " + e.message);
    quit(1);
}

var databaseName = "adavis_platform";
if (typeof process !== "undefined" && process.env && process.env.MONGO_INITDB_DATABASE) {
    databaseName = process.env.MONGO_INITDB_DATABASE;
}

db = db.getSiblingDB(databaseName);
print("[IIOT-SEED] Using database: " + databaseName);

var TENANT_ID = "TNT-0001";

// ============================================
// EXPANDED HIERARCHY CONFIGURATION
// ============================================
// 3 Plants × 4 Blocks × 3 Areas × 5 Rooms = 180 Equipment
var PLANT_IDS = ["PLNT-0001", "PLNT-0002", "PLNT-0003"];
var BLOCK_IDS = ["BLK-0001", "BLK-0002", "BLK-0003", "BLK-0004"];
var AREA_IDS = ["AREA-0001", "AREA-0002", "AREA-0003"];
var ROOM_IDS = ["ROOM-0001", "ROOM-0002", "ROOM-0003", "ROOM-0004", "ROOM-0005"];

var TOTAL_EQUIPMENT = PLANT_IDS.length * BLOCK_IDS.length * AREA_IDS.length * ROOM_IDS.length;

// REDUCED data volume for performance with 180 equipment
var BATCHES_PER_EQUIPMENT = 2;
var CPP_POINTS_PER_BATCH = 4;
var ALARMS_PER_BATCH = 2;

// Equipment types for variety
var EQUIPMENT_TYPES = ["RMG", "FBD", "Comill", "Blender", "Compression"];
var MAKES = ["SKPharma", "Apex Pharma Tech", "GEA Group", "Glatt", "Bohle"];

function logInfo(msg) {
    print("[IIOT-SEED] " + msg);
}

function now() {
    return new Date();
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

// Optimized collection operations
function safeInsert(collectionName, docs) {
    if (!docs || docs.length === 0) return;
    try {
        var col = db.getCollection(collectionName);
        // Insert in smaller batches to avoid memory issues
        var batchSize = 100;
        for (var i = 0; i < docs.length; i += batchSize) {
            var batch = docs.slice(i, Math.min(i + batchSize, docs.length));
            col.insertMany(batch, { ordered: false });
        }
        logInfo("Inserted " + docs.length + " docs into " + collectionName);
    } catch (e) {
        logInfo("Error inserting into " + collectionName + ": " + e.message);
    }
}

function safeUpsert(collectionName, docs, keyField) {
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
            if (ops.length >= 200) {
                col.bulkWrite(ops, { ordered: false });
                ops = [];
            }
        });
        if (ops.length > 0) {
            col.bulkWrite(ops, { ordered: false });
        }
        logInfo("Upserted " + docs.length + " docs into " + collectionName);
    } catch (e) {
        logInfo("Error upserting into " + collectionName + ": " + e.message);
    }
}

function ensureCollection(name) {
    try {
        var collections = db.getCollectionNames();
        if (collections.indexOf(name) === -1) {
            db.createCollection(name);
        }
        return true;
    } catch (e) {
        return false;
    }
}

function resetCollection(name) {
    try {
        if (ensureCollection(name)) {
            db.getCollection(name).deleteMany({});
            return true;
        }
    } catch (e) {
        // Ignore errors
    }
    return false;
}

function createEquipmentDefinitions() {
    var defs = [];
    var equipmentCounter = 0;
    
    PLANT_IDS.forEach(function(plantId) {
        BLOCK_IDS.forEach(function(blockId) {
            AREA_IDS.forEach(function(areaId) {
                ROOM_IDS.forEach(function(roomId) {
                    equipmentCounter++;
                    var eqIdx = equipmentCounter;
                    var eqTypeIndex = (eqIdx - 1) % EQUIPMENT_TYPES.length;
                    var eqType = EQUIPMENT_TYPES[eqTypeIndex];
                    var makeIndex = (eqIdx - 1) % MAKES.length;
                    var make = MAKES[makeIndex];
                    
                    defs.push({
                        equipmentId: eqType + "-" + pad3(eqIdx) + "-PVII",
                        equipmentCode: eqType + pad3(eqIdx) + "PVII",
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
                            room: roomId
                        }
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
    // Only create collections for first 30 equipment to save time
    var maxEquipment = Math.min(EQUIPMENT_DEFS.length, 30);
    for (var i = 0; i < maxEquipment; i++) {
        var eq = EQUIPMENT_DEFS[i];
        names.push(getTimeSeriesCppCollection(eq.equipmentId));
        names.push(getTimeSeriesAlarmCollection(eq.equipmentId));
    }
    return names;
}

function createIndexes() {
    logInfo("Creating indexes...");
    try {
        // Core indexes only - skip time-series indexes for speed
        db.iiot_equiment_master.createIndex({ tenantId: 1, equipmentId: 1 }, { unique: true });
        db.iiot_equiment_master.createIndex({ plantId: 1, blockId: 1, areaId: 1, roomId: 1 });
        db.iiot_equiment_master.createIndex({ equipmentType: 1 });
        
        db.iiot_equipment_critical_parameters.createIndex(
            { tenantId: 1, equipmentId: 1, parameterId: 1 },
            { unique: true }
        );
        
        db.iiot_equipment_critical_parameters_limit.createIndex(
            { tenantId: 1, equipmentId: 1, parameterId: 1, effectiveFrom: -1 }
        );
        
        db.iiot_product_master.createIndex({ tenantId: 1, productId: 1 }, { unique: true });
        db.iiot_source_table_mapping.createIndex({ tenantId: 1, equipmentId: 1 }, { unique: true });
        db.iiot_ingestion_checkpoint.createIndex({ tenantId: 1, equipmentId: 1, streamType: 1 }, { unique: true });
        db.iiot_ingestion_job_run.createIndex({ tenantId: 1, equipmentId: 1, startedAt: -1 });
        db.iiot_equipment_live_status.createIndex({ tenantId: 1, equipmentId: 1 }, { unique: true });
        db.iiot_batch_summary.createIndex({ tenantId: 1, plantId: 1, areaId: 1, equipmentId: 1, batchNo: 1 }, { unique: true });
        
        logInfo("Indexes created successfully");
    } catch (e) {
        logInfo("Error creating indexes: " + e.message);
    }
}

function getProductCatalog(ts) {
    return [
        { productId: "PROD-TRM-50", productCode: "TRM50", productName: "TRAMODOL HCL TABLETS 50MG", tenantId: TENANT_ID, plantId: "PLNT-0001", isActive: true, createdAt: ts, updatedAt: ts },
        { productId: "PROD-IMI-25", productCode: "IMI25", productName: "IMIPRAMINE 25 MG TABLETS", tenantId: TENANT_ID, plantId: "PLNT-0001", isActive: true, createdAt: ts, updatedAt: ts },
        { productId: "PROD-MTF-500", productCode: "MTF500", productName: "METFORMIN HYDROCHLORIDE 500MG", tenantId: TENANT_ID, plantId: "PLNT-0002", isActive: true, createdAt: ts, updatedAt: ts },
        { productId: "PROD-AMX-250", productCode: "AMX250", productName: "AMOXICILLIN 250MG CAPSULES", tenantId: TENANT_ID, plantId: "PLNT-0002", isActive: true, createdAt: ts, updatedAt: ts },
        { productId: "PROD-ATV-20", productCode: "ATV20", productName: "ATORVASTATIN 20MG TABLETS", tenantId: TENANT_ID, plantId: "PLNT-0003", isActive: true, createdAt: ts, updatedAt: ts },
        { productId: "PROD-OMZ-40", productCode: "OMZ40", productName: "OMEPRAZOLE 40MG CAPSULES", tenantId: TENANT_ID, plantId: "PLNT-0003", isActive: true, createdAt: ts, updatedAt: ts },
        { productId: "PROD-LIS-10", productCode: "LIS10", productName: "LISINOPRIL 10MG TABLETS", tenantId: TENANT_ID, plantId: "PLNT-0001", isActive: true, createdAt: ts, updatedAt: ts }
    ];
}

function buildParameterDocs(equipmentId, equipmentIndex, ts) {
    var eqType = EQUIPMENT_TYPES[(equipmentIndex - 1) % EQUIPMENT_TYPES.length];
    var parameters = [
        { suffix: "TEMP", code: "temperature", name: "Temperature", parameterType: "FLOAT", unitOfMeasure: "celsius", isCritical: true },
        { suffix: "PRESS", code: "pressure", name: "Pressure", parameterType: "FLOAT", unitOfMeasure: "bar", isCritical: true }
    ];
    
    // Add equipment-specific parameters
    if (eqType === "RMG") {
        parameters.push(
            { suffix: "IMP", code: "impellerSpeed", name: "Impeller Speed", parameterType: "FLOAT", unitOfMeasure: "rpm", isCritical: true },
            { suffix: "CHOP", code: "chopperSpeed", name: "Chopper Speed", parameterType: "FLOAT", unitOfMeasure: "rpm", isCritical: true }
        );
    } else if (eqType === "FBD") {
        parameters.push(
            { suffix: "AIR", code: "airFlow", name: "Air Flow", parameterType: "FLOAT", unitOfMeasure: "m3/hr", isCritical: true },
            { suffix: "INLET", code: "inletTemp", name: "Inlet Temperature", parameterType: "FLOAT", unitOfMeasure: "celsius", isCritical: true }
        );
    } else if (eqType === "Comill") {
        parameters.push(
            { suffix: "RPM", code: "impellerRPM", name: "Impeller RPM", parameterType: "FLOAT", unitOfMeasure: "rpm", isCritical: true },
            { suffix: "FEED", code: "feedRate", name: "Feed Rate", parameterType: "FLOAT", unitOfMeasure: "kg/hr", isCritical: false }
        );
    } else if (eqType === "Blender") {
        parameters.push(
            { suffix: "ROT", code: "rotationSpeed", name: "Rotation Speed", parameterType: "FLOAT", unitOfMeasure: "rpm", isCritical: true },
            { suffix: "TIME", code: "blendTime", name: "Blend Time", parameterType: "FLOAT", unitOfMeasure: "minutes", isCritical: true }
        );
    } else if (eqType === "Compression") {
        parameters.push(
            { suffix: "FORCE", code: "compressionForce", name: "Compression Force", parameterType: "FLOAT", unitOfMeasure: "kN", isCritical: true },
            { suffix: "SPEED", code: "turretSpeed", name: "Turret Speed", parameterType: "FLOAT", unitOfMeasure: "rpm", isCritical: true }
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

    return { params: paramDocs, limits: limitDocs };
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
        
        var totalProcessed = 0;
        var logInterval = Math.floor(EQUIPMENT_DEFS.length / 10);
        if (logInterval < 10) logInterval = 10;

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
            if (totalProcessed % logInterval === 0) {
                logInfo("  Processed " + totalProcessed + "/" + EQUIPMENT_DEFS.length + " equipment");
            }
        });

        // Use optimized upsert
        safeUpsert("iiot_equiment_master", equipmentDocs, "equipmentId");
        safeUpsert("iiot_product_master", productDocs, "productId");
        safeUpsert("iiot_equipment_critical_parameters", parameterDocs, "parameterId");
        safeUpsert("iiot_equipment_critical_parameters_limit", parameterLimitDocs, "parameterLimitId");
        safeUpsert("iiot_source_table_mapping", sourceMappings, "mappingId");
        
        logInfo("Master data seeded: " + equipmentDocs.length + " equipment");
    } catch (e) {
        logInfo("ERROR in seedMasterData: " + e.message);
    }
}

function seedIngestionData() {
    logInfo("Seeding ingestion data...");
    try {
        var allProducts = db.iiot_product_master.find({ tenantId: TENANT_ID, isActive: true }).toArray();
        if (allProducts.length === 0) {
            logInfo("No products found. Skipping ingestion data.");
            return;
        }
        
        var baseDate = new Date("2026-07-01T00:00:00Z");
        var maxEquipment = Math.min(EQUIPMENT_DEFS.length, 20); // Only process 20 equipment for data
        
        logInfo("Processing " + maxEquipment + " equipment (out of " + EQUIPMENT_DEFS.length + ")");
        
        var checkpointDocs = [];
        var jobRunDocs = [];
        var batchSummaryDocs = [];
        var totalCppRecords = 0;
        var totalAlarmRecords = 0;

        for (var eqIdx = 0; eqIdx < maxEquipment; eqIdx++) {
            var eq = EQUIPMENT_DEFS[eqIdx];
            
            if (eqIdx % 5 === 0 && eqIdx > 0) {
                logInfo("  Processing equipment " + eqIdx + "/" + maxEquipment);
            }
            
            var cppCollection = getTimeSeriesCppCollection(eq.equipmentId);
            var alarmCollection = getTimeSeriesAlarmCollection(eq.equipmentId);
            
            // Ensure collections exist
            ensureCollection(cppCollection);
            ensureCollection(alarmCollection);

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

                for (var pointIdx = 0; pointIdx < CPP_POINTS_PER_BATCH; pointIdx++) {
                    cppSeq += 1;
                    var observedAt = addMinutes(batchStart, pointIdx * 2);
                    
                    // Generate simple metrics
                    var metrics = {
                        temperature: Number((25.0 + (eqIdx % 5) * 0.5 + (pointIdx % 3) * 0.3).toFixed(2)),
                        pressure: Number((1.0 + (eqIdx % 3) * 0.1 + (pointIdx % 2) * 0.05).toFixed(2))
                    };
                    
                    // Add equipment-specific metrics
                    var eqType = eq.equipmentType;
                    if (eqType === "RMG") {
                        metrics.impellerSpeed = Number((150.0 + (eqIdx % 10) * 5.0 + (pointIdx % 4) * 2.0).toFixed(2));
                        metrics.chopperSpeed = Number((3000.0 + (eqIdx % 8) * 100.0 + (pointIdx % 3) * 50.0).toFixed(2));
                    } else if (eqType === "FBD") {
                        metrics.airFlow = Number((500.0 + (eqIdx % 8) * 25.0 + (pointIdx % 3) * 10.0).toFixed(2));
                        metrics.inletTemp = Number((70.0 + (eqIdx % 5) * 2.0 + (pointIdx % 3) * 1.0).toFixed(2));
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
                            equipmentType: eq.equipmentType,
                            status: pointIdx < CPP_POINTS_PER_BATCH - 1 ? "RUNNING" : "STOP",
                            hierarchy: eq.hierarchy
                        },
                        source: {
                            tableName: "SKPharma::CDSSKPharma.B_UDA_" + eq.equipmentCode,
                            sourceSeqId: cppSeq,
                            lastModifiedTime: toIsoDate(observedAt)
                        },
                        metrics: metrics,
                        ingestedAt: now()
                    };

                    cppDocs.push(cppDoc);
                    latestCpp = cppDoc;
                    totalCppRecords++;
                }

                for (var alarmIdx = 0; alarmIdx < ALARMS_PER_BATCH; alarmIdx++) {
                    alarmSeq += 1;
                    var eventAt = addMinutes(batchStart, 3 + alarmIdx * 8);
                    var isAlarm = alarmIdx !== ALARMS_PER_BATCH - 1;
                    
                    alarmEventDocs.push({
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
                            hierarchy: eq.hierarchy
                        },
                        source: {
                            tableName: "SKPharma::CDSSKPharma.AE_" + eq.equipmentCode,
                            sourceSeqId: alarmSeq,
                            lastModifiedTime: toIsoDate(eventAt)
                        },
                        event: {
                            eventCategory: isAlarm ? "ALARM" : "EVENT",
                            eventCode: isAlarm ? "TEMP_OVER_RANGE" : "BATCH_PHASE_CHANGE",
                            eventText: isAlarm ? "Temperature above warning threshold" : "Batch moved to next phase",
                            severity: isAlarm ? "HIGH" : "LOW",
                            eventState: isAlarm ? "OPEN" : "INFO"
                        },
                        ingestedAt: now()
                    });
                    totalAlarmRecords++;
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
                    hierarchy: eq.hierarchy
                });
            }

            // Safe inserts with batching
            safeInsert(cppCollection, cppDocs);
            safeInsert(alarmCollection, alarmEventDocs);

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
                hierarchy: eq.hierarchy
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
                hierarchy: eq.hierarchy
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
                startedAt: toIsoDate(addMinutes(baseDate, eqIdx * 25)),
                completedAt: toIsoDate(addMinutes(baseDate, eqIdx * 25 + 4)),
                createdAt: now(),
                updatedAt: now(),
                hierarchy: eq.hierarchy
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
                startedAt: toIsoDate(addMinutes(baseDate, eqIdx * 25 + 6)),
                completedAt: toIsoDate(addMinutes(baseDate, eqIdx * 25 + 10)),
                createdAt: now(),
                updatedAt: now(),
                hierarchy: eq.hierarchy
            });

            if (latestCpp) {
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
                            stateReason: "Running",
                            lastBatchNo: latestCpp.meta.batchNo,
                            lastLotNo: latestCpp.meta.lotNo,
                            lastSourceSeqId: latestCpp.source.sourceSeqId,
                            lastEventAt: latestCpp.observedAt,
                            heartbeatAt: now(),
                            updatedAt: now(),
                            hierarchy: eq.hierarchy
                        },
                        $setOnInsert: { createdAt: now() }
                    },
                    { upsert: true }
                );
            }
        }

        // Insert summary data
        safeInsert("iiot_ingestion_checkpoint", checkpointDocs);
        safeInsert("iiot_ingestion_job_run", jobRunDocs);
        safeInsert("iiot_batch_summary", batchSummaryDocs);
        
        logInfo("Ingestion data completed!");
        logInfo("  Total CPP records: " + totalCppRecords);
        logInfo("  Total Alarm records: " + totalAlarmRecords);
    } catch (e) {
        logInfo("ERROR in seedIngestionData: " + e.message);
    }
}

function validateHierarchy() {
    logInfo("=== HIERARCHY VALIDATION ===");
    logInfo("Total Equipment: " + EQUIPMENT_DEFS.length);
    logInfo("Expected: " + TOTAL_EQUIPMENT + " (" + PLANT_IDS.length + " Plants × " + BLOCK_IDS.length + " Blocks × " + AREA_IDS.length + " Areas × " + ROOM_IDS.length + " Rooms)");
    
    PLANT_IDS.forEach(function(plantId) {
        var count = EQUIPMENT_DEFS.filter(function(eq) { return eq.plantId === plantId; }).length;
        logInfo("  " + plantId + ": " + count + " equipment");
    });
    
    logInfo("=== VALIDATION COMPLETE ===");
    return true;
}

function runSeed() {
    logInfo("=== STARTING IIOT SEED ===");
    logInfo("Plants: " + PLANT_IDS.length + ", Blocks: " + BLOCK_IDS.length + ", Areas: " + AREA_IDS.length + ", Rooms: " + ROOM_IDS.length);
    logInfo("Total Equipment: " + TOTAL_EQUIPMENT);
    logInfo("Equipment Types: " + EQUIPMENT_TYPES.join(", "));
    
    try {
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
        ];
        
        // Add time-series collections for first 30 equipment
        var tsCollections = getTimeSeriesCollections();
        var allCollections = coreCollections.concat(tsCollections);
        
        logInfo("Resetting " + allCollections.length + " collections...");
        allCollections.forEach(function(name) {
            resetCollection(name);
        });
        
        createIndexes();
        seedMasterData();
        seedIngestionData();
        
        logInfo("=== SEED COMPLETED ===");
        logInfo("Database: " + databaseName);
        logInfo("Total Equipment: " + EQUIPMENT_DEFS.length);
        
        // Show counts
        var collections = db.getCollectionNames().filter(function(name) { 
            return name.startsWith('iiot_') || name === 'products';
        });
        logInfo("Collection counts:");
        collections.forEach(function(name) {
            try {
                var count = db.getCollection(name).countDocuments({});
                print(" - " + name + ": " + count);
            } catch(e) {
                // Skip
            }
        });
    } catch (e) {
        logInfo("FATAL ERROR: " + e.message);
        quit(1);
    }
}

runSeed();
print("[IIOT-SEED] Script completed.");
quit(0);