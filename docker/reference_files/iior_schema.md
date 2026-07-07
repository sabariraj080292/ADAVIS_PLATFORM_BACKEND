# IIOT MongoDB Schema (Per-Equipment Collections)

This document defines the high-volume IIOT schema using **separate collections per equipment** for time-series data.
All properties use **camelCase** naming (for example `tenantId`, `equipmentId`, `batchNo`).

## 1) Naming Conventions

- Property naming: camelCase
- ID fields: suffix `Id`
- Sequence fields from on-prem SQL: `sourceSeqId`
- Timestamp fields: ISO date in UTC
- Per-equipment time-series collection names:
  - `iiot_ts_cpp_<tenantId>_<equipmentId>`
  - `iiot_ts_alarm_event_<tenantId>_<equipmentId>`
- Sanitize collection suffix values to lowercase alphanumeric plus underscore.

Example:
- tenantId = `TENANT_ACME`
- equipmentId = `RMG_100L_2_PVII`
- collections:
  - `iiot_ts_cpp_tenant_acme_rmg_100l_2_pvii`
  - `iiot_ts_alarm_event_tenant_acme_rmg_100l_2_pvii`

## 2) Core Collections (Shared)

## 2.1 `iiotEquipmentMaster`
Purpose: equipment identity and location mapping.

Sample:
```json
{
  "equipmentSeqId": 10021,
  "tenantId": "TENANT_ACME",
  "plantId": "PLNT-1783095376013",
  "blockId": "BLK-1783095376013",
  "areaId": "AREA-1783095376013",
  "roomId": "ROOM-1783095376013",
  "equipmentId": "RMG-100L-2-PVII",
  "equipmentCode": "RMG100L2PVII",
  "equipmentName": "Rapid Mixer Granulator 100L #2",
  "equipmentType": "RMG",
  "make": "SKPharma",
  "model": "RMG-100L",
  "isActive": true,
  "isDeleted": false,
  "createdAt": "2026-07-05T05:10:00Z",
  "updatedAt": "2026-07-05T05:10:00Z"
}
```

Indexes:
- `{ tenantId: 1, equipmentId: 1 }` unique
- `{ tenantId: 1, plantId: 1, areaId: 1 }`

## 2.2 `iiotEquipmentParameter`
Purpose: critical parameters per equipment.

Sample:
```json
{
  "parameterSeqId": 50112,
  "tenantId": "TENANT_ACME",
  "equipmentId": "RMG-100L-2-PVII",
  "parameterId": "PRM-IMP-A",
  "parameterCode": "impellerA",
  "parameterName": "Impeller A",
  "parameterType": "FLOAT",
  "unitOfMeasure": "rpm",
  "isCritical": true,
  "isActive": true,
  "createdAt": "2026-07-05T05:12:00Z",
  "updatedAt": "2026-07-05T05:12:00Z"
}
```

Indexes:
- `{ tenantId: 1, equipmentId: 1, parameterId: 1 }` unique

## 2.3 `iiotEquipmentParameterLimit`
Purpose: alarm/warning/ideal limits for parameters.

Sample:
```json
{
  "parameterLimitSeqId": 90077,
  "tenantId": "TENANT_ACME",
  "equipmentId": "RMG-100L-2-PVII",
  "parameterId": "PRM-IMP-A",
  "lowCriticalValue": 5.5,
  "lowWarningValue": 5.8,
  "idealMinValue": 6.2,
  "idealMaxValue": 6.8,
  "highWarningValue": 7.1,
  "highCriticalValue": 7.5,
  "alarmEnabled": true,
  "effectiveFrom": "2026-01-01T00:00:00Z",
  "effectiveTo": null,
  "isActive": true,
  "updatedAt": "2026-07-05T05:15:00Z"
}
```

Indexes:
- `{ tenantId: 1, equipmentId: 1, parameterId: 1, effectiveFrom: -1 }`

## 2.4 `iiotSourceTableMapping`
Purpose: on-prem SQL table to cloud equipment stream mapping.

Runtime rule for ingestion selection:
- Ingestion must run only for mappings where `isActive = true`.
- Each active mapping represents one equipment and includes both batch and alarm/event source metadata.

Sample:
```json
{
  "mappingId": "MAP-ACME-RMG100L2PVII",
  "tenantId": "TENANT_ACME",
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
  "connectionRef": "SAP-HANA-ACME-01",
  "lastValidatedAt": "2026-07-05T05:18:00Z",
  "validationStatus": "SUCCESS",
  "isActive": true,
  "updatedAt": "2026-07-05T05:20:00Z"
}
```

Indexes:
- `{ tenantId: 1, equipmentId: 1 }` unique
- `{ isActive: 1, tenantId: 1, equipmentId: 1 }`

## 2.5 `iiotIngestionCheckpoint`
Purpose: incremental fetch state per tenant/equipment/stream.

Sample:
```json
{
  "checkpointId": "CP-TENANT_ACME-RMG-100L-2-PVII-BATCH",
  "tenantId": "TENANT_ACME",
  "equipmentId": "RMG-100L-2-PVII",
  "streamType": "BATCH_CPP",
  "sourceTable": "SKPharma::CDSSKPharma.B_UDA_RMG_100L_P7_2",
  "lastProcessedSeqId": 14829,
  "lastProcessedAt": "2026-07-05T05:30:00Z",
  "status": "SUCCESS",
  "updatedAt": "2026-07-05T05:30:00Z"
}
```

Indexes:
- `{ tenantId: 1, equipmentId: 1, streamType: 1 }` unique

## 2.6 `iiotIngestionJobRun`
Purpose: observability and retry audit.

Sample:
```json
{
  "jobRunId": "JOB-20260705-053000-001",
  "tenantId": "TENANT_ACME",
  "equipmentId": "RMG-100L-2-PVII",
  "streamType": "BATCH_CPP",
  "windowStartSeqId": 14790,
  "windowEndSeqId": 14829,
  "recordsRead": 40,
  "recordsWritten": 40,
  "recordsSkipped": 0,
  "status": "SUCCESS",
  "errorSummary": null,
  "startedAt": "2026-07-05T05:30:00Z",
  "completedAt": "2026-07-05T05:30:12Z"
}
```

Indexes:
- `{ tenantId: 1, equipmentId: 1, startedAt: -1 }`

## 2.7 `iiotEquipmentLiveStatus`
Purpose: latest status snapshot for dashboard/monitoring.

Sample:
```json
{
  "tenantId": "TENANT_ACME",
  "equipmentId": "RMG-100L-2-PVII",
  "plantId": "PLNT-1783095376013",
  "areaId": "AREA-1783095376013",
  "currentState": "RUNNING",
  "stateReason": "WET MIXING - 1 RUNNING",
  "lastBatchNo": "TIP24003",
  "lastLotNo": "0",
  "lastSourceSeqId": 14829,
  "lastEventAt": "2024-12-05T06:46:19.673Z",
  "heartbeatAt": "2026-07-05T05:35:00Z",
  "updatedAt": "2026-07-05T05:35:00Z"
}
```

Indexes:
- `{ tenantId: 1, equipmentId: 1 }` unique
- `{ tenantId: 1, plantId: 1, areaId: 1, currentState: 1 }`

## 3) Per-Equipment Time-Series Collections

These are created dynamically from `iiotSourceTableMapping`.

## 3.1 `iiot_ts_cpp_<tenant>_<equipment>`
Type: MongoDB time-series collection.

Recommended options:
- `timeField`: `observedAt`
- `metaField`: `meta`
- `granularity`: `seconds`

Sample document:
```json
{
  "observedAt": "2024-12-05T06:46:19.673Z",
  "meta": {
    "tenantId": "TENANT_ACME",
    "equipmentId": "RMG-100L-2-PVII",
    "plantId": "PLNT-1783095376013",
    "blockId": "BLK-1783095376013",
    "areaId": "AREA-1783095376013",
    "roomId": "ROOM-1783095376013",
    "batchNo": "TIP24003",
    "lotNo": "0",
    "productName": "IMIPRAMINE 25 MG TABLETS",
    "operatorName": "BALKRISHNA",
    "status": "STOP"
  },
  "source": {
    "tableName": "SKPharma::CDSSKPharma.B_UDA_RMG_100L_P7_2",
    "sourceSeqId": 14829,
    "lastModifiedTime": "2024-12-05T06:46:19.673Z",
    "machineDate": "2024-12-05 12:16:16"
  },
  "metrics": {
    "impellerA": 6.89,
    "chopperA": 0,
    "cycle": "WET MIXING - 1 RUNNING",
    "mode": null
  },
  "ingestedAt": "2026-07-05T05:30:10Z"
}
```

Indexes:
- `{ "meta.tenantId": 1, "meta.equipmentId": 1, observedAt: -1 }`
- `{ "meta.batchNo": 1, observedAt: 1 }`
- Unique idempotency key index on `{ "source.tableName": 1, "source.sourceSeqId": 1 }`

## 3.2 `iiot_ts_alarm_event_<tenant>_<equipment>`
Type: MongoDB time-series collection.

Recommended options:
- `timeField`: `eventAt`
- `metaField`: `meta`
- `granularity`: `seconds`

Sample document:
```json
{
  "eventAt": "2024-09-17T17:16:48.994Z",
  "meta": {
    "tenantId": "TENANT_ACME",
    "equipmentId": "RMG-100L-2-PVII",
    "plantId": "PLNT-1783095376013",
    "areaId": "AREA-1783095376013",
    "batchNo": "TRIAL",
    "lotNo": "0",
    "productName": "NA",
    "status": "STOP"
  },
  "source": {
    "tableName": "SKPharma::CDSSKPharma.AE_RMG100L_P7_2",
    "sourceSeqId": 346,
    "lastModifiedTime": "2024-09-17T17:16:48.994Z"
  },
  "event": {
    "eventCategory": "ALARM",
    "eventCode": "CO_MILL_SEAL_PRESSURE_ERROR",
    "eventText": "CO MILL SEAL PRESSURE ERROR",
    "severity": "HIGH",
    "eventState": "OPEN"
  },
  "ingestedAt": "2026-07-05T05:32:11Z"
}
```

Indexes:
- `{ "meta.tenantId": 1, "meta.equipmentId": 1, eventAt: -1 }`
- `{ "meta.batchNo": 1, "event.eventCategory": 1, eventAt: 1 }`
- Unique idempotency key index on `{ "source.tableName": 1, "source.sourceSeqId": 1 }`

## 4) Batch Report Read Model (Optional but Recommended)

## 4.1 `iiotBatchSummary`
Purpose: fast UI filters and summary page.

Sample:
```json
{
  "tenantId": "TENANT_ACME",
  "equipmentId": "RMG-100L-2-PVII",
  "batchNo": "TIP24003",
  "lotNo": "0",
  "productName": "IMIPRAMINE 25 MG TABLETS",
  "plantId": "PLNT-1783095376013",
  "areaId": "AREA-1783095376013",
  "batchStartAt": "2024-12-05T02:12:45.603Z",
  "batchEndAt": "2024-12-05T06:46:19.673Z",
  "batchStatus": "COMPLETED",
  "cppRecordCount": 420,
  "alarmCount": 8,
  "eventCount": 27,
  "updatedAt": "2026-07-05T05:40:00Z"
}
```

Indexes:
- `{ tenantId: 1, plantId: 1, areaId: 1, equipmentId: 1, batchNo: 1 }` unique
- `{ tenantId: 1, productName: 1, batchStartAt: -1 }`

## 5) Ingestion Rules

1. Incremental fetch uses sequence columns:
   - Batch/CPP: `SerialNumber`
   - Alarm/Event: `id`
2. For each run:
   - read `lastProcessedSeqId` from `iiotIngestionCheckpoint`
   - fetch `> lastProcessedSeqId` ordered ascending
   - write to target collection
   - update checkpoint only after successful write
3. Idempotency:
   - enforce unique index on `(source.tableName, source.sourceSeqId)`
4. Parser normalization:
   - trim strings
   - convert `NA`, empty values to `null`
   - map alarm text list separated by `;` into distinct event documents if needed

## 6) Retention and Partition Strategy

- Time-series collections should use TTL based on policy.
- Example policy:
  - CPP: retain 18 months
  - Alarm/Event: retain 24 months
- Keep `iiotBatchSummary` indefinitely or archive yearly.

## 7) API Filter Keys (camelCase)

Batch report APIs should support:
- `tenantId`
- `plantId`
- `areaId`
- `equipmentId`
- `productName`
- `batchNo`
- `lotNo`
- `fromDate`
- `toDate`

## 8) Final Note

Because volume is high and you requested separate collections per equipment, this model is valid and scalable when combined with:
- strict naming rules
- checkpointed incremental ingestion
- idempotency indexes
- retention policy
- read-model collection (`iiotBatchSummary`) for fast UI queries

## 9) Source Sample Schema and Data Mapping (from sample_ingestion_data)

## 9.1 Batch/CPP Source Table

Source DDL reference:
- `sample_ingestion_data/Batch_Report_Ingestion/create.sql`

Source columns (key subset):
- `SerialNumber` -> `source.sourceSeqId`
- `EquipmentId` / `Equipment_ID` -> `meta.equipmentId`
- `Batch_Number` -> `meta.batchNo`
- `Batch_Size` -> `meta.batchSize`
- `LotNumber` -> `meta.lotNo`
- `Operator_Name` -> `meta.operatorName`
- `Product_Name` -> `meta.productName`
- `LastModifiedTime` -> `observedAt` and `source.lastModifiedTime`
- `MachineDate` -> `source.machineDate`
- `Impeller_A` -> `metrics.impellerA`
- `Chopper_A` -> `metrics.chopperA`
- `Cycle` -> `metrics.cycle`
- `Status` -> `meta.status`

Data sample reference:
- `sample_ingestion_data/Batch_Report_Ingestion/data.csv`

Observed characteristics from sample rows:
- Sequence increments by one or with small gaps (`14418`, `14419`, ... `14430`)
- Event cadence is mostly near 30 seconds
- Some formatting variation exists (`22.00KG`, `22. 00KG`, `22.00 KG`)
- `LastModifiedTime` is the best event time source for ordering and time-series writes

## 9.2 Alarm/Event Source Table

Source DDL reference:
- `sample_ingestion_data/Alarms and Events - Ingestion/create_.sql`

Source columns (key subset):
- `id` -> `source.sourceSeqId`
- `Alarm_All` -> `event.eventText` (`eventCategory = ALARM`)
- `Event_All` -> `event.eventText` (`eventCategory = EVENT`)
- `Batch_Number` -> `meta.batchNo`
- `BatchSize` -> `meta.batchSize`
- `LotNumber` -> `meta.lotNo`
- `Operator_Name` -> `meta.operatorName`
- `Product_Name` -> `meta.productName`
- `EquipmentId` / `Equipment_Id` -> `meta.equipmentId`
- `LastModifiedTime` -> `eventAt` and `source.lastModifiedTime`
- `Status` -> `meta.status`

Data sample reference:
- `sample_ingestion_data/Alarms and Events - Ingestion/data__.csv`

Observed characteristics from sample rows:
- Multiple rows also appear at approximately 30-second cadence
- Alarm text may contain leading separators (`;CO MILL SEAL PRESSURE ERROR`)
- Occasional noisy rows exist and should be filtered/normalized (for example mostly empty row values)

## 10) Schema Change vs Ingestion Lag

Short answer:
- Schema change is safe if changes are additive and mapper-based.
- Lag risk rises when schema changes break parsing, increase write amplification, or force reindexing on hot collections.

Recommended approach for safe schema evolution:
1. Keep stable envelope fields: `meta`, `source`, `observedAt` or `eventAt`, `ingestedAt`
2. Add new process fields inside `metrics` or `event` without changing existing keys
3. Version mapping in `iiotSourceTableMapping` (for example `mappingVersion`)
4. Roll out indexes before traffic cutover, not during peak ingestion

Will current schema face lag?
- With current structure, lag should remain low if each equipment stream is ingested independently and bulk writes are used.
- Main lag drivers are typically:
  - very frequent polling with tiny batches
  - missing index on `(source.tableName, source.sourceSeqId)`
  - expensive transformation per row
  - checkpoint updates on every single document instead of batch commit

## 11) Recommended Ingestion Frequency

Based on sample cadence (~30 seconds per row per equipment):

Recommended baseline:
1. Poll every 15 to 30 seconds per equipment stream
2. Use batch size 500 to 2000 rows per pull
3. Commit checkpoint once per successful batch

Burst handling:
1. If lag exceeds 2 poll cycles, temporarily increase batch size to 5000
2. Keep poll interval unchanged; do catch-up using larger batch windows

SLA-oriented guidance:
1. Near real-time dashboard: 10 to 15 seconds
2. Standard operations: 30 seconds
3. Cost-optimized mode: 60 seconds

Practical starting point for your case:
- Poll interval: 30 seconds
- Batch size: 1000
- Parallelism: one worker per equipment for CPP, one worker per equipment for Alarm/Event
- Alert when checkpoint lag is greater than 5 minutes

## 12) UI-Configurable Master and Mapping Design

To make master and source-mapping fully manageable from UI screens, use configuration collections with draft and publish lifecycle.

## 12.1 `iiotUiScreenConfig`
Purpose: control form layout, field visibility, validations, and input widgets for UI screens.

Sample:
```json
{
  "screenConfigId": "SCR-EQUIPMENT-MASTER-V1",
  "tenantId": "TENANT_ACME",
  "screenKey": "equipmentMaster",
  "version": 1,
  "status": "PUBLISHED",
  "sections": [
    {
      "sectionKey": "basicInfo",
      "title": "Basic Information",
      "fields": [
        {
          "fieldKey": "equipmentId",
          "label": "Equipment ID",
          "inputType": "text",
          "required": true,
          "readOnly": false,
          "maxLength": 100
        },
        {
          "fieldKey": "make",
          "label": "Make",
          "inputType": "text",
          "required": false,
          "readOnly": false
        }
      ]
    }
  ],
  "updatedAt": "2026-07-05T07:00:00Z",
  "updatedBy": "IT_ADMIN"
}
```

Indexes:
- `{ tenantId: 1, screenKey: 1, version: -1 }`
- `{ tenantId: 1, screenKey: 1, status: 1 }`

## 12.2 `iiotMasterFieldCatalog`
Purpose: canonical field dictionary used by UI builders and mapping engine.

Sample:
```json
{
  "fieldCatalogId": "FLD-equipmentId",
  "entityKey": "equipmentMaster",
  "fieldKey": "equipmentId",
  "dataType": "string",
  "required": true,
  "isSystemField": true,
  "description": "Business identifier for equipment",
  "validation": {
    "maxLength": 100,
    "pattern": "^[A-Za-z0-9_-]+$"
  }
}
```

Indexes:
- `{ entityKey: 1, fieldKey: 1 }` unique

## 12.3 `iiotSourceMappingConfig`
Purpose: UI-managed mapping from on-prem source columns to canonical target fields.

Sample:
```json
{
  "mappingConfigId": "MAPCFG-TENANT_ACME-RMG-100L-2-PVII",
  "tenantId": "TENANT_ACME",
  "equipmentId": "RMG-100L-2-PVII",
  "streamType": "BATCH_CPP",
  "version": 3,
  "status": "DRAFT",
  "source": {
    "dbType": "SAP_HANA",
    "schemaName": "SKPharma",
    "tableName": "SKPharma::CDSSKPharma.B_UDA_RMG_100L_P7_2",
    "sequenceColumn": "SerialNumber",
    "timestampColumn": "LastModifiedTime"
  },
  "fieldMappings": [
    {
      "sourceColumn": "Batch_Number",
      "targetPath": "meta.batchNo",
      "transform": "trim"
    },
    {
      "sourceColumn": "Impeller_A",
      "targetPath": "metrics.impellerA",
      "transform": "toDouble"
    }
  ],
  "validationRules": [
    {
      "ruleKey": "required-seq",
      "type": "notNull",
      "field": "SerialNumber"
    }
  ],
  "updatedAt": "2026-07-05T07:05:00Z",
  "updatedBy": "IT_ADMIN"
}
```

Indexes:
- `{ tenantId: 1, equipmentId: 1, streamType: 1, version: -1 }`
- `{ tenantId: 1, equipmentId: 1, streamType: 1, status: 1 }`

## 12.4 `iiotSourceMappingPublishHistory`
Purpose: immutable history of published mapping versions for audit and rollback.

Sample:
```json
{
  "publishEventId": "PUB-20260705-070700-001",
  "tenantId": "TENANT_ACME",
  "equipmentId": "RMG-100L-2-PVII",
  "streamType": "BATCH_CPP",
  "publishedVersion": 3,
  "previousVersion": 2,
  "publishedBy": "IT_ADMIN",
  "publishedAt": "2026-07-05T07:07:00Z",
  "changeNote": "Added Batch_Size normalization"
}
```

Indexes:
- `{ tenantId: 1, equipmentId: 1, streamType: 1, publishedAt: -1 }`

## 12.5 Runtime rule

Ingestion workers must read only `PUBLISHED` mapping versions.
UI creates or edits `DRAFT`, validates with preview, then publishes.

## 13) Endpoint List for UI-Compatible Master and Mapping

Base path: `/api/v1/iiot/config`

## 13.1 Equipment Master Screen

1. `GET /api/v1/iiot/config/screens/{screenKey}`
2. `POST /api/v1/iiot/config/screens/{screenKey}/draft`
3. `PUT /api/v1/iiot/config/screens/{screenKey}/draft`
4. `POST /api/v1/iiot/config/screens/{screenKey}/publish`
5. `GET /api/v1/iiot/config/screens/{screenKey}/versions`

## 13.2 Field Catalog

1. `GET /api/v1/iiot/config/field-catalog/{entityKey}`
2. `POST /api/v1/iiot/config/field-catalog/{entityKey}`
3. `PUT /api/v1/iiot/config/field-catalog/{entityKey}/{fieldKey}`

## 13.3 Equipment Master Data CRUD

1. `POST /api/v1/iiot/config/equipment-master`
2. `GET /api/v1/iiot/config/equipment-master`
3. `GET /api/v1/iiot/config/equipment-master/{equipmentId}`
4. `PUT /api/v1/iiot/config/equipment-master/{equipmentId}`
5. `POST /api/v1/iiot/config/equipment-master/{equipmentId}/activate`
6. `POST /api/v1/iiot/config/equipment-master/{equipmentId}/deactivate`

## 13.4 Parameter and Limits Configuration

1. `POST /api/v1/iiot/config/equipment/{equipmentId}/parameters`
2. `GET /api/v1/iiot/config/equipment/{equipmentId}/parameters`
3. `PUT /api/v1/iiot/config/equipment/{equipmentId}/parameters/{parameterId}`
4. `POST /api/v1/iiot/config/equipment/{equipmentId}/parameters/{parameterId}/limits`
5. `GET /api/v1/iiot/config/equipment/{equipmentId}/parameters/{parameterId}/limits`

## 13.5 Source Mapping Screen

1. `GET /api/v1/iiot/config/mappings/{equipmentId}/{streamType}`
2. `POST /api/v1/iiot/config/mappings/{equipmentId}/{streamType}/draft`
3. `PUT /api/v1/iiot/config/mappings/{equipmentId}/{streamType}/draft`
4. `POST /api/v1/iiot/config/mappings/{equipmentId}/{streamType}/validate`
5. `POST /api/v1/iiot/config/mappings/{equipmentId}/{streamType}/preview`
6. `POST /api/v1/iiot/config/mappings/{equipmentId}/{streamType}/publish`
7. `POST /api/v1/iiot/config/mappings/{equipmentId}/{streamType}/rollback/{version}`
8. `GET /api/v1/iiot/config/mappings/{equipmentId}/{streamType}/versions`

## 13.6 Ingestion Runtime Controls

1. `POST /api/v1/iiot/config/ingestion/{equipmentId}/{streamType}/start`
2. `POST /api/v1/iiot/config/ingestion/{equipmentId}/{streamType}/pause`
3. `GET /api/v1/iiot/config/ingestion/{equipmentId}/{streamType}/status`
4. `PUT /api/v1/iiot/config/ingestion/{equipmentId}/{streamType}/schedule`

## 13.7 Checkpoint and Replay Operations

1. `GET /api/v1/iiot/config/checkpoints/{equipmentId}/{streamType}`
2. `PUT /api/v1/iiot/config/checkpoints/{equipmentId}/{streamType}`
3. `POST /api/v1/iiot/config/replay/{equipmentId}/{streamType}`

## 13.8 Runtime Internal Endpoints (service-to-service)

1. `GET /internal/v1/iiot/config/published-mapping/{tenantId}/{equipmentId}/{streamType}`
2. `POST /internal/v1/iiot/config/mapping-preview/execute`
3. `POST /internal/v1/iiot/config/validate-source-connection`

## 13.9 API Cleanup Scope (Implementation Guardrail)

Keep only these IIOT API groups in active code:
1. Master APIs:
  - equipment-master
  - critical-parameters
  - critical-parameter-limits
  - product-master
2. Configuration APIs:
  - source mapping (draft/validate/preview/publish/rollback)
  - ingestion controls (start/pause/status/schedule)
  - checkpoint/replay operations
3. Internal runtime APIs used by ingestion workers.

Remove or deprecate any duplicate or legacy IIOT routes outside this scope.

## 14) Implementation Checklist (Active Equipment Ingestion)

1. Read active mappings from `iiotSourceTableMapping`.
2. For each mapping, ingest both streams (`BATCH_CPP` and `ALARM_EVENT`) on configured interval.
3. Use incremental pull from SQL source based on `lastProcessedSeqId`.
4. Write data into per-equipment time-series collections:
  - `iiot_ts_cpp_<tenant>_<equipment>`
  - `iiot_ts_alarm_event_<tenant>_<equipment>`
5. Enforce idempotency by unique key (`source.tableName`, `source.sourceSeqId`).
6. Update `iiotIngestionCheckpoint` only after successful write commit.
7. Write execution audit to `iiotIngestionJobRun`.
8. Update `iiotEquipmentLiveStatus` snapshot from latest ingested events.
9. Maintain `iiotBatchSummary` read model for UI filters and report pages.
10. Apply retention policy (TTL) for time-series collections.
