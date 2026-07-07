// ============================================
// Adavis IIOT Seed Data (Pharma-Oriented)
// Purpose:
// 1) Create IIOT schema collections used by iiot-service batch ingestion
// 2) Load sample ingestion records (CPP + Alarm/Event) for UI development
// 3) Provide end-to-end demo data for reports and live status
//
// Run (mongosh):
//   mongosh "mongodb://admin:Admin123!@localhost:37017/adavis_platform?authSource=admin" --file docker/seed_data_iiot_file.js
// ============================================

var databaseName = "adavis_platform";
if (typeof process !== "undefined" && process.env && process.env.MONGO_INITDB_DATABASE) {
  databaseName = process.env.MONGO_INITDB_DATABASE;
}

db = db.getSiblingDB(databaseName);

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

  var cppCollection = "iiot_ts_cpp_tnt_0001_rmg_100l_2_pvii";
  var alarmCollection = "iiot_ts_alarm_event_tnt_0001_rmg_100l_2_pvii";

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

  logInfo("Indexes created");
}

function seedMasterData() {
  var ts = now();

  upsertMany("iiot_equiment_master", [
    {
      equipmentSeqId: 10021,
      tenantId: "TNT-0001",
      plantId: "PLNT-1783095376013",
      blockId: "BLK-1783095376013",
      areaId: "AREA-1783095376013",
      roomId: "ROOM-1783095376013",
      equipmentId: "RMG-100L-2-PVII",
      equipmentCode: "RMG100L2PVII",
      equipmentName: "Rapid Mixer Granulator 100L #2",
      equipmentType: "RMG",
      make: "SKPharma",
      model: "RMG-100L",
      isActive: true,
      isDeleted: false,
      createdAt: ts,
      updatedAt: ts
    }
  ], "equipmentId");

  upsertMany("iiot_product_master", [
    {
      productId: "PROD-TRM-50",
      productCode: "TRM50",
      productName: "TRAMODOL HCL TABLETS 50MG",
      tenantId: "TNT-0001",
      plantId: "PLNT-1783095376013",
      isActive: true,
      createdAt: ts,
      updatedAt: ts
    },
    {
      productId: "PROD-IMI-25",
      productCode: "IMI25",
      productName: "IMIPRAMINE 25 MG TABLETS",
      tenantId: "TNT-0001",
      plantId: "PLNT-1783095376013",
      isActive: true,
      createdAt: ts,
      updatedAt: ts
    }
  ], "productId");

  upsertMany("iiot_equipment_critical_parameters", [
    {
      parameterSeqId: 50112,
      tenantId: "TNT-0001",
      equipmentId: "RMG-100L-2-PVII",
      parameterId: "PRM-IMP-A",
      parameterCode: "impellerA",
      parameterName: "Impeller A",
      parameterType: "FLOAT",
      unitOfMeasure: "rpm",
      isCritical: true,
      isActive: true,
      createdAt: ts,
      updatedAt: ts
    },
    {
      parameterSeqId: 50113,
      tenantId: "TNT-0001",
      equipmentId: "RMG-100L-2-PVII",
      parameterId: "PRM-CHP-A",
      parameterCode: "chopperA",
      parameterName: "Chopper A",
      parameterType: "FLOAT",
      unitOfMeasure: "rpm",
      isCritical: false,
      isActive: true,
      createdAt: ts,
      updatedAt: ts
    }
  ], "parameterId");

  upsertMany("iiot_equipment_critical_parameters_limit", [
    {
      parameterLimitId: "LMT-IMP-A-20260101",
      parameterLimitSeqId: 90077,
      tenantId: "TNT-0001",
      equipmentId: "RMG-100L-2-PVII",
      parameterId: "PRM-IMP-A",
      lowCriticalValue: 5.5,
      lowWarningValue: 5.8,
      idealMinValue: 6.2,
      idealMaxValue: 6.8,
      highWarningValue: 7.1,
      highCriticalValue: 7.5,
      alarmEnabled: true,
      effectiveFrom: ISODate("2026-01-01T00:00:00Z"),
      effectiveTo: null,
      isActive: true,
      createdAt: ts,
      updatedAt: ts
    }
  ], "parameterLimitId");

  upsertMany("iiot_source_table_mapping", [
    {
      mappingId: "MAP-TNT-0001-RMG100L2PVII",
      tenantId: "TNT-0001",
      equipmentId: "RMG-100L-2-PVII",
      batchSource: {
        dbType: "SAP_HANA",
        schemaName: "SKPharma",
        tableName: "SKPharma::CDSSKPharma.B_UDA_RMG_100L_P7_2",
        sequenceColumn: "SerialNumber",
        timestampColumn: "LastModifiedTime"
      },
      alarmEventSource: {
        dbType: "SAP_HANA",
        schemaName: "SKPharma",
        tableName: "SKPharma::CDSSKPharma.AE_RMG100L_P7_2",
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
    }
  ], "mappingId");
}

function seedIngestionData() {
  var cppCollection = "iiot_ts_cpp_tnt_0001_rmg_100l_2_pvii";
  var alarmCollection = "iiot_ts_alarm_event_tnt_0001_rmg_100l_2_pvii";

  var cppDocs = [
    {
      observedAt: ISODate("2024-12-05T02:12:45.603Z"),
      meta: {
        tenantId: "TNT-0001",
        equipmentId: "RMG-100L-2-PVII",
        plantId: "PLNT-1783095376013",
        blockId: "BLK-1783095376013",
        areaId: "AREA-1783095376013",
        roomId: "ROOM-1783095376013",
        batchNo: "TIP24003",
        lotNo: "0",
        productName: "TRAMODOL HCL TABLETS 50MG",
        operatorName: "PRATIK",
        status: "STOP"
      },
      source: {
        tableName: "SKPharma::CDSSKPharma.B_UDA_RMG_100L_P7_2",
        sourceSeqId: 14544,
        lastModifiedTime: ISODate("2024-12-05T02:12:45.603Z"),
        machineDate: "2024-12-05 07:42:42"
      },
      metrics: {
        impellerA: 6.54,
        chopperA: 0,
        cycle: "WET MIXING - 1 RUNNING",
        mode: null,
        batchSize: "22.00 KG"
      },
      ingestedAt: now()
    },
    {
      observedAt: ISODate("2024-12-05T03:14:16.590Z"),
      meta: {
        tenantId: "TNT-0001",
        equipmentId: "RMG-100L-2-PVII",
        plantId: "PLNT-1783095376013",
        blockId: "BLK-1783095376013",
        areaId: "AREA-1783095376013",
        roomId: "ROOM-1783095376013",
        batchNo: "TIP24003",
        lotNo: "0",
        productName: "IMIPRAMINE 25 MG TABLETS",
        operatorName: "BALKRISHNA",
        status: "STOP"
      },
      source: {
        tableName: "SKPharma::CDSSKPharma.B_UDA_RMG_100L_P7_2",
        sourceSeqId: 14547,
        lastModifiedTime: ISODate("2024-12-05T03:14:16.590Z"),
        machineDate: "2024-12-05 08:44:13"
      },
      metrics: {
        impellerA: 10.32,
        chopperA: 0,
        cycle: "WET MIXING - 1 RUNNING",
        mode: null,
        batchSize: "18.000 KG"
      },
      ingestedAt: now()
    },
    {
      observedAt: ISODate("2024-12-05T03:16:16.631Z"),
      meta: {
        tenantId: "TNT-0001",
        equipmentId: "RMG-100L-2-PVII",
        plantId: "PLNT-1783095376013",
        blockId: "BLK-1783095376013",
        areaId: "AREA-1783095376013",
        roomId: "ROOM-1783095376013",
        batchNo: "TIP24003",
        lotNo: "0",
        productName: "IMIPRAMINE 25 MG TABLETS",
        operatorName: "BALKRISHNA",
        status: "STOP"
      },
      source: {
        tableName: "SKPharma::CDSSKPharma.B_UDA_RMG_100L_P7_2",
        sourceSeqId: 14548,
        lastModifiedTime: ISODate("2024-12-05T03:16:16.631Z"),
        machineDate: "2024-12-05 08:46:13"
      },
      metrics: {
        impellerA: 6.44,
        chopperA: 0,
        cycle: "DRY MIXING - 1 RUNNING",
        mode: null,
        batchSize: "18.000 KG"
      },
      ingestedAt: now()
    },
    {
      observedAt: ISODate("2024-12-05T03:18:16.648Z"),
      meta: {
        tenantId: "TNT-0001",
        equipmentId: "RMG-100L-2-PVII",
        plantId: "PLNT-1783095376013",
        blockId: "BLK-1783095376013",
        areaId: "AREA-1783095376013",
        roomId: "ROOM-1783095376013",
        batchNo: "TIP24003",
        lotNo: "0",
        productName: "IMIPRAMINE 25 MG TABLETS",
        operatorName: "BALKRISHNA",
        status: "STOP"
      },
      source: {
        tableName: "SKPharma::CDSSKPharma.B_UDA_RMG_100L_P7_2",
        sourceSeqId: 14552,
        lastModifiedTime: ISODate("2024-12-05T03:18:16.648Z"),
        machineDate: "2024-12-05 08:48:13"
      },
      metrics: {
        impellerA: 6.36,
        chopperA: 0,
        cycle: "DRY MIXING - 1 RUNNING",
        mode: null,
        batchSize: "18.000 KG"
      },
      ingestedAt: now()
    },
    {
      observedAt: ISODate("2024-12-05T03:21:16.660Z"),
      meta: {
        tenantId: "TNT-0001",
        equipmentId: "RMG-100L-2-PVII",
        plantId: "PLNT-1783095376013",
        blockId: "BLK-1783095376013",
        areaId: "AREA-1783095376013",
        roomId: "ROOM-1783095376013",
        batchNo: "TIP24003",
        lotNo: "0",
        productName: "IMIPRAMINE 25 MG TABLETS",
        operatorName: "BALKRISHNA",
        status: "STOP"
      },
      source: {
        tableName: "SKPharma::CDSSKPharma.B_UDA_RMG_100L_P7_2",
        sourceSeqId: 14558,
        lastModifiedTime: ISODate("2024-12-05T03:21:16.660Z"),
        machineDate: "2024-12-05 08:51:13"
      },
      metrics: {
        impellerA: 6.33,
        chopperA: 0,
        cycle: "WET MIXING - 1 RUNNING",
        mode: null,
        batchSize: "18.000 KG"
      },
      ingestedAt: now()
    },
    {
      observedAt: ISODate("2024-12-05T03:23:46.730Z"),
      meta: {
        tenantId: "TNT-0001",
        equipmentId: "RMG-100L-2-PVII",
        plantId: "PLNT-1783095376013",
        blockId: "BLK-1783095376013",
        areaId: "AREA-1783095376013",
        roomId: "ROOM-1783095376013",
        batchNo: "TIP24003",
        lotNo: "0",
        productName: "IMIPRAMINE 25 MG TABLETS",
        operatorName: "BALKRISHNA",
        status: "STOP"
      },
      source: {
        tableName: "SKPharma::CDSSKPharma.B_UDA_RMG_100L_P7_2",
        sourceSeqId: 14563,
        lastModifiedTime: ISODate("2024-12-05T03:23:46.730Z"),
        machineDate: "2024-12-05 08:53:43"
      },
      metrics: {
        impellerA: 6.27,
        chopperA: 0,
        cycle: "WET MIXING - 1 RUNNING",
        mode: null,
        batchSize: "18.000 KG"
      },
      ingestedAt: now()
    }
  ];

  var alarmEventDocs = [
    {
      eventAt: ISODate("2024-09-17T17:14:48.961Z"),
      meta: {
        tenantId: "TNT-0001",
        equipmentId: "RMG-100L-2-PVII",
        plantId: "PLNT-1783095376013",
        areaId: "AREA-1783095376013",
        batchNo: "TRIAL",
        lotNo: "0",
        productName: "NA",
        status: "STOP"
      },
      source: {
        tableName: "SKPharma::CDSSKPharma.AE_RMG100L_P7_2",
        sourceSeqId: 342,
        lastModifiedTime: ISODate("2024-09-17T17:14:48.961Z")
      },
      event: {
        eventCategory: "ALARM",
        eventCode: "CO_MILL_SEAL_PRESSURE_ERROR",
        eventText: "CO MILL SEAL PRESSURE ERROR",
        severity: "HIGH",
        eventState: "OPEN"
      },
      ingestedAt: now()
    },
    {
      eventAt: ISODate("2024-09-17T17:15:49.014Z"),
      meta: {
        tenantId: "TNT-0001",
        equipmentId: "RMG-100L-2-PVII",
        plantId: "PLNT-1783095376013",
        areaId: "AREA-1783095376013",
        batchNo: "TRIAL",
        lotNo: "0",
        productName: "NA",
        status: "STOP"
      },
      source: {
        tableName: "SKPharma::CDSSKPharma.AE_RMG100L_P7_2",
        sourceSeqId: 344,
        lastModifiedTime: ISODate("2024-09-17T17:15:49.014Z")
      },
      event: {
        eventCategory: "ALARM",
        eventCode: "CO_MILL_SEAL_PRESSURE_ERROR",
        eventText: "CO MILL SEAL PRESSURE ERROR",
        severity: "HIGH",
        eventState: "OPEN"
      },
      ingestedAt: now()
    },
    {
      eventAt: ISODate("2024-09-17T17:16:18.991Z"),
      meta: {
        tenantId: "TNT-0001",
        equipmentId: "RMG-100L-2-PVII",
        plantId: "PLNT-1783095376013",
        areaId: "AREA-1783095376013",
        batchNo: "TRIAL",
        lotNo: "0",
        productName: "NA",
        status: "STOP"
      },
      source: {
        tableName: "SKPharma::CDSSKPharma.AE_RMG100L_P7_2",
        sourceSeqId: 345,
        lastModifiedTime: ISODate("2024-09-17T17:16:18.991Z")
      },
      event: {
        eventCategory: "ALARM",
        eventCode: "CO_MILL_SEAL_PRESSURE_ERROR",
        eventText: "CO MILL SEAL PRESSURE ERROR",
        severity: "HIGH",
        eventState: "OPEN"
      },
      ingestedAt: now()
    },
    {
      eventAt: ISODate("2024-09-17T17:16:48.994Z"),
      meta: {
        tenantId: "TNT-0001",
        equipmentId: "RMG-100L-2-PVII",
        plantId: "PLNT-1783095376013",
        areaId: "AREA-1783095376013",
        batchNo: "TRIAL",
        lotNo: "0",
        productName: "NA",
        status: "STOP"
      },
      source: {
        tableName: "SKPharma::CDSSKPharma.AE_RMG100L_P7_2",
        sourceSeqId: 346,
        lastModifiedTime: ISODate("2024-09-17T17:16:48.994Z")
      },
      event: {
        eventCategory: "ALARM",
        eventCode: "CO_MILL_SEAL_PRESSURE_ERROR",
        eventText: "CO MILL SEAL PRESSURE ERROR",
        severity: "HIGH",
        eventState: "OPEN"
      },
      ingestedAt: now()
    },
    {
      eventAt: ISODate("2023-12-27T13:42:15.044Z"),
      meta: {
        tenantId: "TNT-0001",
        equipmentId: "RMG-100L-2-PVII",
        plantId: "PLNT-1783095376013",
        areaId: "AREA-1783095376013",
        batchNo: "AJ23002",
        lotNo: "1",
        productName: "TRIAL 02",
        status: "START"
      },
      source: {
        tableName: "SKPharma::CDSSKPharma.AE_RMG100L_P7_2",
        sourceSeqId: 6,
        lastModifiedTime: ISODate("2023-12-27T13:42:15.044Z")
      },
      event: {
        eventCategory: "ALARM",
        eventCode: "EMERGENCY_PRESSED",
        eventText: "EMERGENCY PRESSED",
        severity: "CRITICAL",
        eventState: "OPEN"
      },
      ingestedAt: now()
    }
  ];

  db.getCollection(cppCollection).insertMany(cppDocs, { ordered: false });
  db.getCollection(alarmCollection).insertMany(alarmEventDocs, { ordered: false });
  logInfo("Inserted CPP docs: " + cppDocs.length + " into " + cppCollection);
  logInfo("Inserted Alarm/Event docs: " + alarmEventDocs.length + " into " + alarmCollection);

  db.iiot_ingestion_checkpoint.insertMany([
    {
      checkpointId: "CP-TNT-0001-RMG-100L-2-PVII-BATCH_CPP",
      tenantId: "TNT-0001",
      equipmentId: "RMG-100L-2-PVII",
      streamType: "BATCH_CPP",
      sourceTable: "SKPharma::CDSSKPharma.B_UDA_RMG_100L_P7_2",
      lastProcessedSeqId: 14563,
      lastProcessedAt: now(),
      status: "SUCCESS",
      updatedAt: now()
    },
    {
      checkpointId: "CP-TNT-0001-RMG-100L-2-PVII-ALARM_EVENT",
      tenantId: "TNT-0001",
      equipmentId: "RMG-100L-2-PVII",
      streamType: "ALARM_EVENT",
      sourceTable: "SKPharma::CDSSKPharma.AE_RMG100L_P7_2",
      lastProcessedSeqId: 346,
      lastProcessedAt: now(),
      status: "SUCCESS",
      updatedAt: now()
    }
  ]);

  db.iiot_ingestion_job_run.insertMany([
    {
      jobRunId: "JOB-SEED-BATCH-001",
      tenantId: "TNT-0001",
      equipmentId: "RMG-100L-2-PVII",
      streamType: "BATCH_CPP",
      windowStartSeqId: 14544,
      windowEndSeqId: 14563,
      recordsRead: 6,
      recordsWritten: 6,
      recordsSkipped: 0,
      status: "SUCCESS",
      errorSummary: null,
      startedAt: ISODate("2026-07-07T05:30:00Z"),
      completedAt: ISODate("2026-07-07T05:30:12Z"),
      createdAt: now(),
      updatedAt: now()
    },
    {
      jobRunId: "JOB-SEED-ALARM-001",
      tenantId: "TNT-0001",
      equipmentId: "RMG-100L-2-PVII",
      streamType: "ALARM_EVENT",
      windowStartSeqId: 342,
      windowEndSeqId: 346,
      recordsRead: 5,
      recordsWritten: 5,
      recordsSkipped: 0,
      status: "SUCCESS",
      errorSummary: null,
      startedAt: ISODate("2026-07-07T05:31:00Z"),
      completedAt: ISODate("2026-07-07T05:31:08Z"),
      createdAt: now(),
      updatedAt: now()
    }
  ]);

  db.iiot_equipment_live_status.updateOne(
    { tenantId: "TNT-0001", equipmentId: "RMG-100L-2-PVII" },
    {
      $set: {
        tenantId: "TNT-0001",
        equipmentId: "RMG-100L-2-PVII",
        plantId: "PLNT-1783095376013",
        areaId: "AREA-1783095376013",
        currentState: "STOP",
        stateReason: "WET MIXING - 1 RUNNING",
        lastBatchNo: "TIP24003",
        lastLotNo: "0",
        lastSourceSeqId: 14563,
        lastEventAt: ISODate("2024-12-05T03:23:46.730Z"),
        heartbeatAt: now(),
        updatedAt: now()
      },
      $setOnInsert: { createdAt: now() }
    },
    { upsert: true }
  );

  db.iiot_batch_summary.updateOne(
    { tenantId: "TNT-0001", equipmentId: "RMG-100L-2-PVII", batchNo: "TIP24003" },
    {
      $set: {
        tenantId: "TNT-0001",
        equipmentId: "RMG-100L-2-PVII",
        batchNo: "TIP24003",
        lotNo: "0",
        productName: "IMIPRAMINE 25 MG TABLETS",
        plantId: "PLNT-1783095376013",
        areaId: "AREA-1783095376013",
        batchStartAt: ISODate("2024-12-05T02:12:45.603Z"),
        batchEndAt: ISODate("2024-12-05T03:23:46.730Z"),
        batchStatus: "COMPLETED",
        cppRecordCount: 6,
        alarmCount: 5,
        eventCount: 0,
        updatedAt: now()
      },
      $setOnInsert: { createdAt: now() }
    },
    { upsert: true }
  );
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
    "iiot_batch_summary",
    "iiot_ts_cpp_tnt_0001_rmg_100l_2_pvii",
    "iiot_ts_alarm_event_tnt_0001_rmg_100l_2_pvii"
  ];

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
