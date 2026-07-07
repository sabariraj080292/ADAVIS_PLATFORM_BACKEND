IIOT implementation checklist (for confirmation before code changes)

1) Canonical collection names to use
- iiotEquipmentMaster
- iiotEquipmentParameter
- iiotEquipmentParameterLimit
- iiotSourceTableMapping
- iiotIngestionCheckpoint
- iiotIngestionJobRun
- iiotEquipmentLiveStatus
- iiotBatchSummary
- iiot_ts_cpp_<tenant>_<equipment>
- iiot_ts_alarm_event_<tenant>_<equipment>

2) Source mapping model to implement
- Keep one active mapping per tenant + equipment in iiotSourceTableMapping.
- Mapping must include both sources:
    - batchSource for batch/CPP SQL table
    - alarmEventSource for alarm/event SQL table
- Add runtime controls in mapping document:
    - isActive
    - pollIntervalSeconds
    - batchSize
    - connectionRef (reference to source DB connection)
    - lastValidatedAt
    - validationStatus

3) Ingestion behavior (active equipment only)
- Scheduler runs every pollIntervalSeconds per active equipment mapping.
- For each equipment, run two stream jobs:
    - BATCH_CPP stream
    - ALARM_EVENT stream
- Read lastProcessedSeqId from iiotIngestionCheckpoint.
- Query source SQL table with sequence > lastProcessedSeqId ordered ascending.
- Transform and write into per-equipment time-series collections.
- Enforce idempotency with unique key: source.tableName + source.sourceSeqId.
- Update checkpoint only after successful batch write.
- Write run audit to iiotIngestionJobRun for each execution.
- Update iiotEquipmentLiveStatus snapshot from latest ingested records.

4) Time-series collection strategy
- Create collection lazily when first data arrives for equipment + stream.
- Naming:
    - iiot_ts_cpp_<tenant>_<equipment>
    - iiot_ts_alarm_event_<tenant>_<equipment>
- Apply indexes:
    - tenant/equipment + event time
    - batchNo lookup
    - idempotency index
- Add retention policy by TTL:
    - CPP: 18 months
    - Alarm/Event: 24 months

5) Batch report read model
- Build/refresh iiotBatchSummary during ingestion or by async updater.
- UI filters supported:
    - tenantId, plantId, areaId, equipmentId, productName, batchNo, lotNo, fromDate, toDate
- UI result tables:
    - CPP
    - Alarms
    - Events

6) API scope cleanup (remove unnecessary APIs)
- Keep only these API groups:
    - Equipment master CRUD (activate/deactivate)
    - Equipment parameter CRUD (activate/deactivate)
    - Parameter limit CRUD (activate/deactivate)
    - Product master CRUD (activate/deactivate)
    - Source mapping draft/validate/preview/publish/rollback
    - Ingestion runtime controls (start/pause/status/schedule)
    - Checkpoint/replay operations
    - Internal mapping endpoints for ingestion worker
- Remove legacy asset/tag/threshold API routes and other duplicate IIOT API routes that are not part of above scope.

7) Sequence of implementation
- Step 1: finalize source mapping schema and indexes.
- Step 2: implement ingestion scheduler + worker pipeline.
- Step 3: implement checkpoint, job-run, and live status updates.
- Step 4: add/align mapping and ingestion control APIs.
- Step 5: remove unnecessary IIOT APIs after confirmation.
- Step 6: run module compile and smoke test with sample ingestion data.

8) Confirmation required
- Confirm this scope and API cleanup list.
- On confirmation, code changes will be made for scheduler, mapping runtime, and API removals.






