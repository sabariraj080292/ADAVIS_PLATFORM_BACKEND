// ============================================
// Adavis IIOT Seed Data (Pharma-Oriented)
// Purpose:
// 1) Create IIOT schema collections used by iiot-service batch ingestion
// 2) Load realistic sample ingestion records for UI development
// 3) Provide demo data with multi-equipment/multi-batch coverage
// ============================================

var databaseName = "adavis_platform";
if (typeof process !== "undefined" && process.env && process.env.MONGO_INITDB_DATABASE) {
  databaseName = process.env.MONGO_INITDB_DATABASE;
}

db = db.getSiblingDB(databaseName);

var TENANT_ID = "TNT-0001";
var BASE_PLANT_ID = "PLNT-1783095376013";
var BASE_BLOCK_ID = "BLK-1783095376013";
var BASE_AREA_ID = "AREA-1783095376013";
var BASE_ROOM_ID = "ROOM-1783095376013";

var EQUIPMENT_COUNT = 10;
var BATCHES_PER_EQUIPMENT = 10;
var CPP_POINTS_PER_BATCH = 12;
var ALARMS_PER_BATCH = 3;

function logInfo(msg) {
  print("[IIOT-SEED] " + msg);
}

function now() {
  return new Date();
}

function ensureCollection(name) {
  var collections = db.getCollectionNames();
  if (collections.indexOf(name) === -1) {
    db.createCollection(name);
    logInfo("Created collection: " + name);
  }
}

function resetCollection(name) {
  ensureCollection(name);
  db.getCollection(name).deleteMany({});
  logInfo("Cleared collection: " + name);
}

function upsertMany(collectionName, docs, keyField) {
  var col = db.getCollection(collectionName);
  docs.forEach(function (doc) {
    var filter = {};
    filter[keyField] = doc[keyField];
    col.updateOne(filter, { $set: doc }, { upsert: true });
  });
  logInfo("Upserted " + docs.length + " docs into " + collectionName);
}

function pad2(value) {
  return (value < 10 ? "0" : "") + value;
}

function toIsoDate(value) {
  return ISODate(value.toISOString());
}

function addMinutes(base, minutes) {
  return new Date(base.getTime() + minutes * 60000);
}

function createEquipmentDefinitions() {
  var defs = [];
  for (var i = 1; i <= EQUIPMENT_COUNT; i++) {
    var codePart = "RMG-100L-" + pad2(i);
    defs.push({
      equipmentId: codePart + "-PVII",
      equipmentCode: "RMG100L" + pad2(i) + "PVII",
      equipmentName: "Rapid Mixer Granulator 100L #" + i,
      plantId: BASE_PLANT_ID,
      blockId: BASE_BLOCK_ID,
      areaId: BASE_AREA_ID + "-" + pad2(i),
      roomId: BASE_ROOM_ID + "-" + pad2(i),
      make: i % 2 === 0 ? "SKPharma" : "Apex Pharma Tech",
      model: "RMG-100L",
      equipmentType: "RMG"
    });
  }
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
  db.iiot_equiment_master.createIndex({ tenantId: 1, equipmentId: 1 }, { unique: true, name: "ux_eq_tenant_equipment" });
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
  db.iiot_ingestion_checkpoint.createIndex(
    { tenantId: 1, equipmentId: 1, streamType: 1 },
    { unique: true, name: "ux_checkpoint_stream" }
  );
  db.iiot_ingestion_job_run.createIndex({ tenantId: 1, equipmentId: 1, startedAt: -1 }, { name: "ix_jobrun_latest" });
  db.iiot_equipment_live_status.createIndex(
    { tenantId: 1, equipmentId: 1 },
    { unique: true, name: "ux_live_status_tenant_equipment" }
  );
  db.iiot_batch_summary.createIndex(
    { tenantId: 1, plantId: 1, areaId: 1, equipmentId: 1, batchNo: 1 },
    { unique: true, name: "ux_batch_summary_lookup" }
  );

  EQUIPMENT_DEFS.forEach(function (eq) {
    var cppCollection = getTimeSeriesCppCollection(eq.equipmentId);
    var alarmCollection = getTimeSeriesAlarmCollection(eq.equipmentId);

    db.getCollection(cppCollection).createIndex(
      { "meta.tenantId": 1, "meta.equipmentId": 1, observedAt: -1 },
      { name: "ix_cpp_meta_time" }
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
      { "meta.batchNo": 1, "event.eventCategory": 1, eventAt: 1 },
      { name: "ix_alarm_batch_category_time" }
    );
    db.getCollection(alarmCollection).createIndex(
      { "source.tableName": 1, "source.sourceSeqId": 1, "event.eventCode": 1 },
      { unique: true, name: "ux_alarm_source_seq_event" }
    );
  });

  logInfo("Indexes created");
}

function getProductCatalog(ts) {
  return [
    {
      productId: "PROD-TRM-50",
      productCode: "TRM50",
      productName: "TRAMODOL HCL TABLETS 50MG",
      tenantId: TENANT_ID,
      plantId: BASE_PLANT_ID,
      isActive: true,
      createdAt: ts,
      updatedAt: ts
    },
    {
      productId: "PROD-IMI-25",
      productCode: "IMI25",
      productName: "IMIPRAMINE 25 MG TABLETS",
      tenantId: TENANT_ID,
      plantId: BASE_PLANT_ID,
      isActive: true,
      createdAt: ts,
      updatedAt: ts
    },
    {
      productId: "PROD-MTF-500",
      productCode: "MTF500",
      productName: "METFORMIN HYDROCHLORIDE 500MG",
      tenantId: TENANT_ID,
      plantId: BASE_PLANT_ID,
      isActive: true,
      createdAt: ts,
      updatedAt: ts
    },
    {
      productId: "PROD-AMX-250",
      productCode: "AMX250",
      productName: "AMOXICILLIN 250MG CAPSULES",
      tenantId: TENANT_ID,
      plantId: BASE_PLANT_ID,
      isActive: true,
      createdAt: ts,
      updatedAt: ts
    },
    {
      productId: "PROD-ATV-20",
      productCode: "ATV20",
      productName: "ATORVASTATIN 20MG TABLETS",
      tenantId: TENANT_ID,
      plantId: BASE_PLANT_ID,
      isActive: true,
      createdAt: ts,
      updatedAt: ts
    }
  ];
}

function buildParameterDocs(equipmentId, equipmentIndex, ts) {
  var parameters = [
    {
      suffix: "IMP-A",
      code: "impellerA",
      name: "Impeller A",
      parameterType: "FLOAT",
      unitOfMeasure: "rpm",
      isCritical: true
    },
    {
      suffix: "CHP-A",
      code: "chopperA",
      name: "Chopper A",
      parameterType: "FLOAT",
      unitOfMeasure: "rpm",
      isCritical: true
    }
  ];

  if (equipmentIndex % 2 === 0) {
    parameters.push({
      suffix: "BED-T",
      code: "bedTemp",
      name: "Bed Temperature",
      parameterType: "FLOAT",
      unitOfMeasure: "celsius",
      isCritical: false
    });
  }

  var paramDocs = [];
  var limitDocs = [];

  parameters.forEach(function (p, idx) {
    var parameterId = "PRM-" + p.suffix + "-" + pad2(equipmentIndex + 1);
    var parameterLimitId = "LMT-" + p.suffix + "-" + pad2(equipmentIndex + 1) + "-20260101";
    var base = 6.0 + equipmentIndex * 0.2 + idx * 0.35;

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
  var ts = now();
  var equipmentDocs = [];
  var parameterDocs = [];
  var parameterLimitDocs = [];
  var sourceMappings = [];
  var productDocs = getProductCatalog(ts);

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
      updatedAt: ts
    });

    var paramPayload = buildParameterDocs(eq.equipmentId, index, ts);
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
      updatedAt: ts
    });
  });

  upsertMany("iiot_equiment_master", equipmentDocs, "equipmentId");
  upsertMany("iiot_product_master", productDocs, "productId");
  upsertMany("iiot_equipment_critical_parameters", parameterDocs, "parameterId");
  upsertMany("iiot_equipment_critical_parameters_limit", parameterLimitDocs, "parameterLimitId");
  upsertMany("iiot_source_table_mapping", sourceMappings, "mappingId");
}

function seedIngestionData() {
  var allProducts = db.iiot_product_master.find({ tenantId: TENANT_ID, isActive: true }).toArray();
  var baseDate = new Date("2026-07-01T00:00:00Z");

  var checkpointDocs = [];
  var jobRunDocs = [];
  var batchSummaryDocs = [];

  EQUIPMENT_DEFS.forEach(function (eq, eqIndex) {
    var cppCollection = getTimeSeriesCppCollection(eq.equipmentId);
    var alarmCollection = getTimeSeriesAlarmCollection(eq.equipmentId);

    var cppDocs = [];
    var alarmEventDocs = [];
    var latestCpp = null;

    var cppSeq = 100000 + eqIndex * 10000;
    var alarmSeq = 200000 + eqIndex * 10000;

    for (var batchIdx = 1; batchIdx <= BATCHES_PER_EQUIPMENT; batchIdx++) {
      var product = allProducts[(eqIndex + batchIdx) % allProducts.length];
      var batchNo = "B" + pad2(eqIndex + 1) + "-2026-" + pad2(batchIdx);
      var lotNo = "L" + pad2(batchIdx);
      var batchStart = addMinutes(baseDate, eqIndex * 120 + batchIdx * 45);
      var operatorName = batchIdx % 2 === 0 ? "BALKRISHNA" : "PRATIK";

      for (var pointIdx = 0; pointIdx < CPP_POINTS_PER_BATCH; pointIdx++) {
        cppSeq += 1;
        var observedAt = addMinutes(batchStart, pointIdx * 2);
        var impeller = 6.1 + eqIndex * 0.15 + (pointIdx % 5) * 0.08;
        var chopper = 1.2 + eqIndex * 0.1 + (pointIdx % 4) * 0.06;
        var bedTemp = 24.0 + eqIndex * 0.4 + (pointIdx % 6) * 0.5;

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
            status: pointIdx < CPP_POINTS_PER_BATCH - 1 ? "RUNNING" : "STOP"
          },
          source: {
            tableName: "SKPharma::CDSSKPharma.B_UDA_" + eq.equipmentCode,
            sourceSeqId: cppSeq,
            lastModifiedTime: toIsoDate(observedAt),
            machineDate: observedAt.toISOString().slice(0, 19).replace("T", " ")
          },
          metrics: {
            impellerA: Number(impeller.toFixed(2)),
            chopperA: Number(chopper.toFixed(2)),
            bedTemp: Number(bedTemp.toFixed(2)),
            cycle: pointIdx < CPP_POINTS_PER_BATCH / 2 ? "DRY MIXING - 1 RUNNING" : "WET MIXING - 1 RUNNING",
            mode: "AUTO",
            batchSize: (18 + (batchIdx % 4) * 2) + ".000 KG"
          },
          ingestedAt: now()
        };

        cppDocs.push(cppDoc);
        latestCpp = cppDoc;
      }

      for (var alarmIdx = 0; alarmIdx < ALARMS_PER_BATCH; alarmIdx++) {
        alarmSeq += 1;
        var eventAt = addMinutes(batchStart, 4 + alarmIdx * 9);
        var isAlarm = alarmIdx !== ALARMS_PER_BATCH - 1;
        alarmEventDocs.push({
          eventAt: toIsoDate(eventAt),
          meta: {
            tenantId: TENANT_ID,
            equipmentId: eq.equipmentId,
            plantId: eq.plantId,
            areaId: eq.areaId,
            batchNo: batchNo,
            lotNo: lotNo,
            productName: product.productName,
            status: "RUNNING"
          },
          source: {
            tableName: "SKPharma::CDSSKPharma.AE_" + eq.equipmentCode,
            sourceSeqId: alarmSeq,
            lastModifiedTime: toIsoDate(eventAt)
          },
          event: {
            eventCategory: isAlarm ? "ALARM" : "EVENT",
            eventCode: isAlarm ? "IMP_OVER_RANGE" : "BATCH_PHASE_CHANGE",
            eventText: isAlarm ? "Impeller above warning threshold" : "Batch moved to next phase",
            severity: isAlarm ? (alarmIdx === 0 ? "HIGH" : "MEDIUM") : "LOW",
            eventState: isAlarm ? "OPEN" : "INFO"
          },
          ingestedAt: now()
        });
      }

      batchSummaryDocs.push({
        tenantId: TENANT_ID,
        equipmentId: eq.equipmentId,
        batchNo: batchNo,
        lotNo: lotNo,
        productName: product.productName,
        plantId: eq.plantId,
        areaId: eq.areaId,
        batchStartAt: toIsoDate(batchStart),
        batchEndAt: toIsoDate(addMinutes(batchStart, (CPP_POINTS_PER_BATCH - 1) * 2)),
        batchStatus: "COMPLETED",
        cppRecordCount: CPP_POINTS_PER_BATCH,
        alarmCount: ALARMS_PER_BATCH - 1,
        eventCount: 1,
        createdAt: now(),
        updatedAt: now()
      });
    }

    if (cppDocs.length > 0) {
      db.getCollection(cppCollection).insertMany(cppDocs, { ordered: false });
      logInfo("Inserted CPP docs: " + cppDocs.length + " into " + cppCollection);
    }

    if (alarmEventDocs.length > 0) {
      db.getCollection(alarmCollection).insertMany(alarmEventDocs, { ordered: false });
      logInfo("Inserted Alarm/Event docs: " + alarmEventDocs.length + " into " + alarmCollection);
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
      updatedAt: now()
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
      updatedAt: now()
    });

    jobRunDocs.push({
      jobRunId: "JOB-SEED-BATCH-" + pad2(eqIndex + 1),
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
      startedAt: toIsoDate(addMinutes(baseDate, eqIndex * 60)),
      completedAt: toIsoDate(addMinutes(baseDate, eqIndex * 60 + 5)),
      createdAt: now(),
      updatedAt: now()
    });

    jobRunDocs.push({
      jobRunId: "JOB-SEED-ALARM-" + pad2(eqIndex + 1),
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
      startedAt: toIsoDate(addMinutes(baseDate, eqIndex * 60 + 8)),
      completedAt: toIsoDate(addMinutes(baseDate, eqIndex * 60 + 12)),
      createdAt: now(),
      updatedAt: now()
    });

    if (latestCpp !== null) {
      db.iiot_equipment_live_status.updateOne(
        { tenantId: TENANT_ID, equipmentId: eq.equipmentId },
        {
          $set: {
            tenantId: TENANT_ID,
            equipmentId: eq.equipmentId,
            plantId: eq.plantId,
            areaId: eq.areaId,
            currentState: "RUNNING",
            stateReason: latestCpp.metrics.cycle,
            lastBatchNo: latestCpp.meta.batchNo,
            lastLotNo: latestCpp.meta.lotNo,
            lastSourceSeqId: latestCpp.source.sourceSeqId,
            lastEventAt: latestCpp.observedAt,
            heartbeatAt: now(),
            updatedAt: now()
          },
          $setOnInsert: { createdAt: now() }
        },
        { upsert: true }
      );
    }
  });

  if (checkpointDocs.length > 0) {
    db.iiot_ingestion_checkpoint.insertMany(checkpointDocs, { ordered: false });
    logInfo("Inserted checkpoints: " + checkpointDocs.length);
  }

  if (jobRunDocs.length > 0) {
    db.iiot_ingestion_job_run.insertMany(jobRunDocs, { ordered: false });
    logInfo("Inserted job runs: " + jobRunDocs.length);
  }

  if (batchSummaryDocs.length > 0) {
    db.iiot_batch_summary.insertMany(batchSummaryDocs, { ordered: false });
    logInfo("Inserted batch summaries: " + batchSummaryDocs.length);
  }
}

function runSeed() {
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

  coreCollections.forEach(resetCollection);
  createIndexes();
  seedMasterData();
  seedIngestionData();

  logInfo("Seed completed for database: " + databaseName);
  logInfo("Collection counts:");
  coreCollections.forEach(function (c) {
    print(" - " + c + ": " + db.getCollection(c).countDocuments({}));
  });
}

runSeed();
