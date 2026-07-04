package com.adavis.iiot.service;

import com.adavis.common.exception.BusinessException;
import com.mongodb.MongoWriteException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class IiotOperationsService {

    private static final String DEFAULT_TENANT_ID = "TNT-0001";
    private static final String DEFAULT_PLANT_ID = "PLNT-0001";

    private static final String ASSETS_COLLECTION = "iiot_assets";
    private static final String ASSET_TAGS_COLLECTION = "iiot_asset_tags";
    private static final String TAG_THRESHOLDS_COLLECTION = "iiot_tag_thresholds";
    private static final String TELEMETRY_COLLECTION = "iiot_telemetry";
    private static final String STATE_COLLECTION = "iiot_asset_states";
    private static final String OEE_CONFIG_COLLECTION = "iiot_oee_config";
    private static final String OEE_METRICS_COLLECTION = "iiot_oee_metrics";
    private static final String ALARM_RULES_COLLECTION = "iiot_alarm_rules";
    private static final String ALARM_EVENTS_COLLECTION = "iiot_alarm_events";
    private static final String REALTIME_COLLECTION = "iiot_realtime_cache";
    private static final String REALTIME_REDIS_KEY_PREFIX = "iiot:realtime:";

    private final MongoTemplate mongoTemplate;
    private final StringRedisTemplate stringRedisTemplate;
    private final ObjectMapper objectMapper;

    public Map<String, Object> createAsset(Map<String, Object> request) {
        String assetId = requireText(request, "assetId");
        String assetCode = requireText(request, "assetCode");
        String tenantId = firstNonBlank(stringValue(request.get("tenantId")), DEFAULT_TENANT_ID);

        Query query = new Query(new Criteria().orOperator(
                Criteria.where("assetId").is(assetId),
                Criteria.where("tenantId").is(tenantId).and("assetCode").is(assetCode)));
        Document existing = mongoTemplate.findOne(query, Document.class, ASSETS_COLLECTION);
        if (existing != null) {
            throw new BusinessException("Asset already exists: " + assetCode);
        }

        Document doc = new Document(request);
        doc.put("assetId", assetId);
        doc.put("assetCode", assetCode);
        doc.put("tenantId", tenantId);
        doc.put("isActive", request.getOrDefault("isActive", true));
        doc.put("createdAt", Date.from(Instant.now()));
        doc.put("updatedAt", Date.from(Instant.now()));
        return insertDocument(doc, ASSETS_COLLECTION, "Asset already exists: " + assetCode);
    }

    public List<Map<String, Object>> getAssets() {
        Query query = new Query(new Criteria().orOperator(
            Criteria.where("isActive").exists(false),
            Criteria.where("isActive").is(true)));
        query.with(Sort.by(Sort.Direction.ASC, "assetId", "assetCode"));
        return mongoTemplate.find(query, Document.class, ASSETS_COLLECTION).stream().map(this::toMap).toList();
    }

    public Map<String, Object> getAsset(String assetId) {
        return toMap(requireActiveDocumentByBusinessKey(ASSETS_COLLECTION, "assetId", assetId));
    }

    public Map<String, Object> updateAsset(String assetId, Map<String, Object> request) {
        Document existing = requireActiveDocumentByBusinessKey(ASSETS_COLLECTION, "assetId", assetId);
        request.forEach((k, v) -> {
            if (!"_id".equals(k) && !"assetId".equals(k)) {
                existing.put(k, v);
            }
        });
        existing.put("updatedAt", Date.from(Instant.now()));
        return toMap(mongoTemplate.save(existing, ASSETS_COLLECTION));
    }

    public Map<String, Object> deleteAsset(String assetId) {
        Document existing = requireActiveDocumentByBusinessKey(ASSETS_COLLECTION, "assetId", assetId);
        existing.put("isActive", false);
        existing.put("updatedAt", Date.from(Instant.now()));
        return toMap(mongoTemplate.save(existing, ASSETS_COLLECTION));
    }

    public Map<String, Object> reactivateAsset(String assetId) {
        return reactivateDocumentByBusinessKey(ASSETS_COLLECTION, "assetId", assetId);
    }

    public Map<String, Object> createAssetTag(Map<String, Object> request) {
        String tagId = requireText(request, "tagId");
        String assetCode = requireText(request, "assetCode");
        String tagCode = requireText(request, "tagCode");
        String tenantId = firstNonBlank(stringValue(request.get("tenantId")), DEFAULT_TENANT_ID);

        Query query = new Query(new Criteria().orOperator(
                Criteria.where("tagId").is(tagId),
                Criteria.where("tenantId").is(tenantId).and("assetCode").is(assetCode).and("tagCode").is(tagCode)));
        Document existing = mongoTemplate.findOne(query, Document.class, ASSET_TAGS_COLLECTION);
        if (existing != null) {
            throw new BusinessException("Asset tag already exists: " + tagCode);
        }

        Document doc = new Document(request);
        doc.put("tagId", tagId);
        doc.put("assetCode", assetCode);
        doc.put("tagCode", tagCode);
        doc.put("tenantId", tenantId);
        doc.put("isActive", request.getOrDefault("isActive", true));
        doc.put("createdAt", Date.from(Instant.now()));
        doc.put("updatedAt", Date.from(Instant.now()));
        return insertDocument(doc, ASSET_TAGS_COLLECTION, "Asset tag already exists: " + tagCode);
    }

    public List<Map<String, Object>> getAssetTags() {
        Query query = new Query(new Criteria().orOperator(
            Criteria.where("isActive").exists(false),
            Criteria.where("isActive").is(true)));
        query.with(Sort.by(Sort.Direction.ASC, "tagId", "tagCode"));
        return mongoTemplate.find(query, Document.class, ASSET_TAGS_COLLECTION).stream().map(this::toMap).toList();
    }

    public Map<String, Object> getAssetTag(String tagId) {
        return toMap(requireActiveDocumentByBusinessKey(ASSET_TAGS_COLLECTION, "tagId", tagId));
    }

    public Map<String, Object> updateAssetTag(String tagId, Map<String, Object> request) {
        Document existing = requireActiveDocumentByBusinessKey(ASSET_TAGS_COLLECTION, "tagId", tagId);
        request.forEach((k, v) -> {
            if (!"_id".equals(k) && !"tagId".equals(k)) {
                existing.put(k, v);
            }
        });
        existing.put("updatedAt", Date.from(Instant.now()));
        return toMap(mongoTemplate.save(existing, ASSET_TAGS_COLLECTION));
    }

    public Map<String, Object> deleteAssetTag(String tagId) {
        Document existing = requireActiveDocumentByBusinessKey(ASSET_TAGS_COLLECTION, "tagId", tagId);
        existing.put("isActive", false);
        existing.put("updatedAt", Date.from(Instant.now()));
        return toMap(mongoTemplate.save(existing, ASSET_TAGS_COLLECTION));
    }

    public Map<String, Object> reactivateAssetTag(String tagId) {
        return reactivateDocumentByBusinessKey(ASSET_TAGS_COLLECTION, "tagId", tagId);
    }

    public Map<String, Object> createTagThreshold(Map<String, Object> request) {
        String thresholdId = requireText(request, "thresholdId");
        String tenantId = firstNonBlank(stringValue(request.get("tenantId")), DEFAULT_TENANT_ID);
        String plantId = firstNonBlank(stringValue(request.get("plantId")), DEFAULT_PLANT_ID);

        Query query = new Query(new Criteria().orOperator(
                Criteria.where("thresholdId").is(thresholdId),
                Criteria.where("tenantId").is(tenantId).and("plantId").is(plantId).and("thresholdId").is(thresholdId)));
        Document existing = mongoTemplate.findOne(query, Document.class, TAG_THRESHOLDS_COLLECTION);
        if (existing != null) {
            throw new BusinessException("Tag threshold already exists: " + thresholdId);
        }

        Document doc = new Document(request);
        doc.put("thresholdId", thresholdId);
        doc.put("tenantId", tenantId);
        doc.put("plantId", plantId);
        doc.put("isActive", request.getOrDefault("isActive", true));
        doc.put("createdAt", Date.from(Instant.now()));
        doc.put("updatedAt", Date.from(Instant.now()));
        return insertDocument(doc, TAG_THRESHOLDS_COLLECTION, "Tag threshold already exists: " + thresholdId);
    }

    public List<Map<String, Object>> getTagThresholds() {
        Query query = new Query(new Criteria().orOperator(
            Criteria.where("isActive").exists(false),
            Criteria.where("isActive").is(true)));
        query.with(Sort.by(Sort.Direction.ASC, "thresholdId", "tagCode"));
        return mongoTemplate.find(query, Document.class, TAG_THRESHOLDS_COLLECTION).stream().map(this::toMap).toList();
    }

    public Map<String, Object> getTagThreshold(String thresholdId) {
        return toMap(requireActiveDocumentByBusinessKey(TAG_THRESHOLDS_COLLECTION, "thresholdId", thresholdId));
    }

    public Map<String, Object> updateTagThreshold(String thresholdId, Map<String, Object> request) {
        Document existing = requireActiveDocumentByBusinessKey(TAG_THRESHOLDS_COLLECTION, "thresholdId", thresholdId);
        request.forEach((k, v) -> {
            if (!"_id".equals(k) && !"thresholdId".equals(k)) {
                existing.put(k, v);
            }
        });
        existing.put("updatedAt", Date.from(Instant.now()));
        return toMap(mongoTemplate.save(existing, TAG_THRESHOLDS_COLLECTION));
    }

    public Map<String, Object> deleteTagThreshold(String thresholdId) {
        Document existing = requireActiveDocumentByBusinessKey(TAG_THRESHOLDS_COLLECTION, "thresholdId", thresholdId);
        existing.put("isActive", false);
        existing.put("updatedAt", Date.from(Instant.now()));
        return toMap(mongoTemplate.save(existing, TAG_THRESHOLDS_COLLECTION));
    }

    public Map<String, Object> reactivateTagThreshold(String thresholdId) {
        return reactivateDocumentByBusinessKey(TAG_THRESHOLDS_COLLECTION, "thresholdId", thresholdId);
    }

    public Map<String, Object> ingestRaw(Map<String, Object> payload) {
        String deviceId = stringValue(payload.get("deviceId"));
        String providedAssetCode = stringValue(payload.get("assetCode"));
        Map<String, Object> data = asMap(payload.get("data"));
        if (data.isEmpty()) {
            throw new BusinessException("data payload is required");
        }

        Instant eventTime = parseInstant(payload.get("timestamp"));
        String assetCode = resolveAssetCode(deviceId, providedAssetCode);

        int written = 0;
        for (Map.Entry<String, Object> entry : data.entrySet()) {
            Double value = toDouble(entry.getValue());
            if (value == null) {
                continue;
            }

            Document telemetry = new Document();
            telemetry.put("assetCode", assetCode);
            telemetry.put("deviceId", deviceId);
            telemetry.put("tagCode", entry.getKey());
            telemetry.put("value", value);
            telemetry.put("timestamp", Date.from(eventTime));
            telemetry.put("createdAt", Date.from(Instant.now()));
            mongoTemplate.insert(telemetry, TELEMETRY_COLLECTION);
            written++;
        }

        String state = resolveState(data);
        upsertCurrentState(assetCode, state, eventTime);
        String alarmStatus = processAlarmEvents(assetCode, data, eventTime);
        updateRealtimeCache(assetCode, data, state, alarmStatus, eventTime);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("assetCode", assetCode);
        response.put("deviceId", deviceId);
        response.put("telemetryRecords", written);
        response.put("state", state);
        response.put("alarm", alarmStatus);
        response.put("timestamp", eventTime.toString());
        return response;
    }

    public List<Map<String, Object>> getTelemetryLatest(String assetCode, String tagCode, Integer limit) {
        Query query = new Query();
        if (assetCode != null && !assetCode.isBlank()) {
            query.addCriteria(Criteria.where("assetCode").is(assetCode));
        }
        if (tagCode != null && !tagCode.isBlank()) {
            query.addCriteria(Criteria.where("tagCode").is(tagCode));
        }

        int maxRows = limit == null || limit <= 0 ? 200 : Math.min(limit, 1000);
        query.with(Sort.by(Sort.Direction.DESC, "timestamp")).limit(maxRows);

        Map<String, Map<String, Object>> latest = new LinkedHashMap<>();
        for (Document doc : mongoTemplate.find(query, Document.class, TELEMETRY_COLLECTION)) {
            String key = doc.getString("assetCode") + "|" + doc.getString("tagCode");
            latest.putIfAbsent(key, toMap(doc));
        }
        return new ArrayList<>(latest.values());
    }

    public List<Map<String, Object>> getTelemetryHistory(String assetCode, String tagCode, Instant from, Instant to, Integer limit) {
        Query query = new Query();
        if (assetCode != null && !assetCode.isBlank()) {
            query.addCriteria(Criteria.where("assetCode").is(assetCode));
        }
        if (tagCode != null && !tagCode.isBlank()) {
            query.addCriteria(Criteria.where("tagCode").is(tagCode));
        }
        if (from != null || to != null) {
            Criteria timeCriteria = Criteria.where("timestamp");
            if (from != null) {
                timeCriteria = timeCriteria.gte(Date.from(from));
            }
            if (to != null) {
                timeCriteria = timeCriteria.lte(Date.from(to));
            }
            query.addCriteria(timeCriteria);
        }

        int maxRows = limit == null || limit <= 0 ? 500 : Math.min(limit, 5000);
        query.with(Sort.by(Sort.Direction.DESC, "timestamp")).limit(maxRows);
        return mongoTemplate.find(query, Document.class, TELEMETRY_COLLECTION).stream().map(this::toMap).toList();
    }

    public Map<String, Object> getCurrentState(String assetCode) {
        Query query = new Query(Criteria.where("assetCode").is(assetCode).and("endTime").is(null));
        query.with(Sort.by(Sort.Direction.DESC, "startTime")).limit(1);
        Document doc = mongoTemplate.findOne(query, Document.class, STATE_COLLECTION);
        if (doc == null) {
            Map<String, Object> fallback = new LinkedHashMap<>();
            fallback.put("assetCode", assetCode);
            fallback.put("state", "UNKNOWN");
            fallback.put("startTime", null);
            fallback.put("endTime", null);
            return fallback;
        }
        return toMap(doc);
    }

    public List<Map<String, Object>> getStateHistory(String assetCode, Instant from, Instant to, Integer limit) {
        Query query = new Query();
        if (assetCode != null && !assetCode.isBlank()) {
            query.addCriteria(Criteria.where("assetCode").is(assetCode));
        }
        if (from != null || to != null) {
            Criteria timeCriteria = Criteria.where("startTime");
            if (from != null) {
                timeCriteria = timeCriteria.gte(Date.from(from));
            }
            if (to != null) {
                timeCriteria = timeCriteria.lte(Date.from(to));
            }
            query.addCriteria(timeCriteria);
        }
        int maxRows = limit == null || limit <= 0 ? 300 : Math.min(limit, 3000);
        query.with(Sort.by(Sort.Direction.DESC, "startTime")).limit(maxRows);
        return mongoTemplate.find(query, Document.class, STATE_COLLECTION).stream().map(this::toMap).toList();
    }

    public Map<String, Object> getRealtimeSnapshot(String assetCode) {
        String redisKey = REALTIME_REDIS_KEY_PREFIX + assetCode;
        try {
            String payload = stringRedisTemplate.opsForValue().get(redisKey);
            if (payload != null && !payload.isBlank()) {
                return objectMapper.readValue(payload, new TypeReference<>() {});
            }
        } catch (Exception ex) {
            log.warn("Realtime cache read failed for {}: {}", assetCode, ex.getMessage());
        }

        Query query = new Query(Criteria.where("assetCode").is(assetCode));
        Document snapshot = mongoTemplate.findOne(query, Document.class, REALTIME_COLLECTION);
        if (snapshot != null) {
            return toMap(snapshot);
        }

        Map<String, Object> fallback = new LinkedHashMap<>();
        fallback.put("assetCode", assetCode);
        fallback.put("state", "UNKNOWN");
        fallback.put("alarm", "NONE");
        fallback.put("updatedAt", null);
        return fallback;
    }

    public Map<String, Object> getOeeMetric(String assetCode, LocalDate date) {
        LocalDate effectiveDate = date == null ? LocalDate.now(ZoneOffset.UTC) : date;
        Query existingQuery = new Query(Criteria.where("assetCode").is(assetCode).and("date").is(effectiveDate.toString()));
        Document existing = mongoTemplate.findOne(existingQuery, Document.class, OEE_METRICS_COLLECTION);
        if (existing != null) {
            return toMap(existing);
        }

        Map<String, Object> computed = computeOee(assetCode, effectiveDate);
        mongoTemplate.save(new Document(computed), OEE_METRICS_COLLECTION);
        return computed;
    }

    public List<Map<String, Object>> getOeeReport(LocalDate fromDate, LocalDate toDate, String assetCode) {
        Query query = new Query();
        if (assetCode != null && !assetCode.isBlank()) {
            query.addCriteria(Criteria.where("assetCode").is(assetCode));
        }
        if (fromDate != null || toDate != null) {
            Criteria dateCriteria = Criteria.where("date");
            if (fromDate != null) {
                dateCriteria = dateCriteria.gte(fromDate.toString());
            }
            if (toDate != null) {
                dateCriteria = dateCriteria.lte(toDate.toString());
            }
            query.addCriteria(dateCriteria);
        }
        query.with(Sort.by(Sort.Direction.DESC, "date", "assetCode"));
        return mongoTemplate.find(query, Document.class, OEE_METRICS_COLLECTION).stream().map(this::toMap).toList();
    }

    public Map<String, Object> createAlarmRule(Map<String, Object> request) {
        String ruleCode = requireText(request, "ruleCode");
        String assetCode = requireText(request, "assetCode");

        Query query = new Query(Criteria.where("ruleCode").is(ruleCode).and("assetCode").is(assetCode));
        Document existing = mongoTemplate.findOne(query, Document.class, ALARM_RULES_COLLECTION);

        Document doc = existing != null ? existing : new Document();
        doc.put("ruleCode", ruleCode);
        doc.put("assetCode", assetCode);
        putIfPresent(doc, request, "tagCode");
        putIfPresent(doc, request, "condition");
        putIfPresent(doc, request, "threshold");
        putIfPresent(doc, request, "severity");
        putIfPresent(doc, request, "message");
        doc.put("isActive", request.getOrDefault("isActive", true));
        doc.put("updatedAt", Date.from(Instant.now()));
        if (!doc.containsKey("createdAt")) {
            doc.put("createdAt", Date.from(Instant.now()));
        }

        return toMap(mongoTemplate.save(doc, ALARM_RULES_COLLECTION));
    }

    public List<Map<String, Object>> getAlarmRules(String assetCode, Boolean activeOnly) {
        Query query = new Query();
        if (assetCode != null && !assetCode.isBlank()) {
            query.addCriteria(Criteria.where("assetCode").is(assetCode));
        }
        if (Boolean.TRUE.equals(activeOnly)) {
            query.addCriteria(Criteria.where("isActive").is(true));
        }
        query.with(Sort.by(Sort.Direction.ASC, "severity", "ruleCode"));
        return mongoTemplate.find(query, Document.class, ALARM_RULES_COLLECTION).stream().map(this::toMap).toList();
    }

    public List<Map<String, Object>> getActiveAlarmEvents(String assetCode) {
        Query query = new Query(Criteria.where("status").is("ACTIVE"));
        if (assetCode != null && !assetCode.isBlank()) {
            query.addCriteria(Criteria.where("assetCode").is(assetCode));
        }
        query.with(Sort.by(Sort.Direction.DESC, "triggeredAt"));
        return mongoTemplate.find(query, Document.class, ALARM_EVENTS_COLLECTION).stream().map(this::toMap).toList();
    }

    public Map<String, Object> acknowledgeAlarm(String id, Map<String, Object> request) {
        Document doc = findAlarmEventById(id);
        if (doc == null) {
            throw new BusinessException("Alarm event not found: " + id);
        }
        doc.put("status", "ACKNOWLEDGED");
        doc.put("acknowledgedAt", Date.from(Instant.now()));
        doc.put("acknowledgedBy", request.getOrDefault("acknowledgedBy", "SYSTEM"));
        doc.put("updatedAt", Date.from(Instant.now()));
        return toMap(mongoTemplate.save(doc, ALARM_EVENTS_COLLECTION));
    }

    public Map<String, Object> clearAlarm(String id, Map<String, Object> request) {
        Document doc = findAlarmEventById(id);
        if (doc == null) {
            throw new BusinessException("Alarm event not found: " + id);
        }
        doc.put("status", "CLEARED");
        doc.put("clearedAt", Date.from(Instant.now()));
        doc.put("clearedBy", request.getOrDefault("clearedBy", "SYSTEM"));
        doc.put("updatedAt", Date.from(Instant.now()));
        return toMap(mongoTemplate.save(doc, ALARM_EVENTS_COLLECTION));
    }

    private Map<String, Object> computeOee(String assetCode, LocalDate date) {
        Instant dayStart = date.atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant dayEnd = dayStart.plus(1, ChronoUnit.DAYS);

        Query configQuery = new Query(Criteria.where("assetCode").is(assetCode));
        Document config = mongoTemplate.findOne(configQuery, Document.class, OEE_CONFIG_COLLECTION);
        double plannedProductionTime = toDouble(config != null ? config.get("plannedProductionTime") : null) != null
                ? Objects.requireNonNull(toDouble(config.get("plannedProductionTime")))
                : 28800d;

        Query stateQuery = new Query(Criteria.where("assetCode").is(assetCode)
                .and("startTime").lt(Date.from(dayEnd))
                .andOperator(new Criteria().orOperator(
                        Criteria.where("endTime").is(null),
                        Criteria.where("endTime").gte(Date.from(dayStart))
                )));

        double runningSeconds = 0d;
        for (Document state : mongoTemplate.find(stateQuery, Document.class, STATE_COLLECTION)) {
            String stateCode = stringValue(state.get("state"));
            if (!"RUNNING".equalsIgnoreCase(stateCode)) {
                continue;
            }
            Instant start = toInstant(state.get("startTime"));
            Instant end = toInstant(state.get("endTime"));
            if (start == null) {
                continue;
            }
            Instant effectiveStart = start.isBefore(dayStart) ? dayStart : start;
            Instant effectiveEnd = end == null || end.isAfter(dayEnd) ? dayEnd : end;
            if (effectiveEnd.isAfter(effectiveStart)) {
                runningSeconds += ChronoUnit.SECONDS.between(effectiveStart, effectiveEnd);
            }
        }

        double availability = clamp(runningSeconds / plannedProductionTime);

        Query rpmQuery = new Query(Criteria.where("assetCode").is(assetCode)
                .and("tagCode").is("RPM")
                .and("timestamp").gte(Date.from(dayStart)).lte(Date.from(dayEnd)));
        List<Document> rpmDocs = mongoTemplate.find(rpmQuery, Document.class, TELEMETRY_COLLECTION);
        double performance = 1d;
        if (!rpmDocs.isEmpty()) {
            double sum = 0d;
            double max = 0d;
            for (Document rpm : rpmDocs) {
                Double value = toDouble(rpm.get("value"));
                if (value != null) {
                    sum += value;
                    max = Math.max(max, value);
                }
            }
            performance = max > 0 ? clamp((sum / rpmDocs.size()) / max) : 1d;
        }

        double quality = toDouble(config != null ? config.get("qualityFactor") : null) != null
                ? clamp(Objects.requireNonNull(toDouble(config.get("qualityFactor"))))
                : 0.97d;

        double oee = clamp(availability * performance * quality);

        Map<String, Object> metric = new LinkedHashMap<>();
        metric.put("assetCode", assetCode);
        metric.put("date", date.toString());
        metric.put("availability", round4(availability));
        metric.put("performance", round4(performance));
        metric.put("quality", round4(quality));
        metric.put("oee", round4(oee));
        metric.put("createdAt", Date.from(Instant.now()));
        metric.put("updatedAt", Date.from(Instant.now()));
        return metric;
    }

    private String processAlarmEvents(String assetCode, Map<String, Object> data, Instant eventTime) {
        Query rulesQuery = new Query(Criteria.where("assetCode").is(assetCode).and("isActive").is(true));
        List<Document> rules = mongoTemplate.find(rulesQuery, Document.class, ALARM_RULES_COLLECTION);

        boolean hasActiveAlarm = false;
        for (Document rule : rules) {
            String tagCode = stringValue(rule.get("tagCode"));
            String condition = stringValue(rule.get("condition"));
            Double threshold = toDouble(rule.get("threshold"));
            Double value = toDouble(data.get(tagCode));
            if (tagCode == null || condition == null || threshold == null || value == null) {
                continue;
            }

            boolean triggered = evaluate(condition, value, threshold);
            Query activeQuery = new Query(Criteria.where("ruleCode").is(rule.get("ruleCode"))
                    .and("assetCode").is(assetCode)
                    .and("status").is("ACTIVE"));
            Document active = mongoTemplate.findOne(activeQuery, Document.class, ALARM_EVENTS_COLLECTION);

            if (triggered) {
                hasActiveAlarm = true;
                if (active == null) {
                    Document event = new Document();
                    event.put("ruleCode", rule.get("ruleCode"));
                    event.put("assetCode", assetCode);
                    event.put("tagCode", tagCode);
                    event.put("value", value);
                    event.put("status", "ACTIVE");
                    event.put("severity", rule.getOrDefault("severity", "MEDIUM"));
                    event.put("message", rule.getOrDefault("message", "Alarm triggered"));
                    event.put("triggeredAt", Date.from(eventTime));
                    event.put("createdAt", Date.from(Instant.now()));
                    event.put("updatedAt", Date.from(Instant.now()));
                    mongoTemplate.insert(event, ALARM_EVENTS_COLLECTION);
                }
            } else if (active != null) {
                active.put("status", "CLEARED");
                active.put("clearedAt", Date.from(eventTime));
                active.put("updatedAt", Date.from(Instant.now()));
                mongoTemplate.save(active, ALARM_EVENTS_COLLECTION);
            }
        }

        return hasActiveAlarm ? "ACTIVE" : "NONE";
    }

    private boolean evaluate(String condition, double value, double threshold) {
        String normalized = condition.toUpperCase(Locale.ROOT);
        return switch (normalized) {
            case "GREATER_THAN", "GT" -> value > threshold;
            case "GREATER_OR_EQUAL", "GTE" -> value >= threshold;
            case "LESS_THAN", "LT" -> value < threshold;
            case "LESS_OR_EQUAL", "LTE" -> value <= threshold;
            case "EQUAL", "EQ" -> Double.compare(value, threshold) == 0;
            default -> false;
        };
    }

    private void upsertCurrentState(String assetCode, String state, Instant when) {
        Query currentQuery = new Query(Criteria.where("assetCode").is(assetCode).and("endTime").is(null));
        currentQuery.with(Sort.by(Sort.Direction.DESC, "startTime")).limit(1);
        Document current = mongoTemplate.findOne(currentQuery, Document.class, STATE_COLLECTION);

        if (current != null) {
            String currentState = stringValue(current.get("state"));
            if (state.equalsIgnoreCase(currentState)) {
                return;
            }
            current.put("endTime", Date.from(when));
            current.put("updatedAt", Date.from(Instant.now()));
            mongoTemplate.save(current, STATE_COLLECTION);
        }

        Document next = new Document();
        next.put("assetCode", assetCode);
        next.put("state", state);
        next.put("startTime", Date.from(when));
        next.put("endTime", null);
        next.put("createdAt", Date.from(Instant.now()));
        next.put("updatedAt", Date.from(Instant.now()));
        mongoTemplate.insert(next, STATE_COLLECTION);
    }

    private void updateRealtimeCache(String assetCode, Map<String, Object> data, String state, String alarm, Instant when) {
        Query query = new Query(Criteria.where("assetCode").is(assetCode));
        Document current = mongoTemplate.findOne(query, Document.class, REALTIME_COLLECTION);

        Document snapshot = current != null ? current : new Document();
        snapshot.put("assetCode", assetCode);
        snapshot.put("tags", new HashMap<>(data));
        snapshot.putAll(data);
        snapshot.put("state", state);
        snapshot.put("alarm", alarm);
        snapshot.put("updatedAt", Date.from(when));
        snapshot.put("createdAt", snapshot.getOrDefault("createdAt", Date.from(Instant.now())));
        mongoTemplate.save(snapshot, REALTIME_COLLECTION);

        try {
            Map<String, Object> redisSnapshot = toMap(snapshot);
            String redisKey = REALTIME_REDIS_KEY_PREFIX + assetCode;
            stringRedisTemplate.opsForValue().set(redisKey, objectMapper.writeValueAsString(redisSnapshot), Duration.ofHours(24));
        } catch (Exception ex) {
            log.warn("Realtime cache write failed for {}: {}", assetCode, ex.getMessage());
        }
    }

    private String resolveState(Map<String, Object> data) {
        Object explicitState = data.get("STATE");
        if (explicitState != null) {
            String state = String.valueOf(explicitState).trim();
            if (!state.isEmpty()) {
                return state.toUpperCase(Locale.ROOT);
            }
        }

        Double rpm = toDouble(data.get("RPM"));
        if (rpm != null) {
            return rpm > 0 ? "RUNNING" : "STOPPED";
        }

        return "UNKNOWN";
    }

    private String resolveAssetCode(String deviceId, String providedAssetCode) {
        if (providedAssetCode != null && !providedAssetCode.isBlank()) {
            return providedAssetCode;
        }
        if (deviceId == null || deviceId.isBlank()) {
            throw new BusinessException("assetCode or deviceId is required");
        }

        Query query = new Query(Criteria.where("deviceId").is(deviceId));
        Document asset = mongoTemplate.findOne(query, Document.class, ASSETS_COLLECTION);
        if (asset != null && !Boolean.FALSE.equals(asset.get("isActive")) && asset.get("assetCode") != null) {
            return String.valueOf(asset.get("assetCode"));
        }

        Query byCode = new Query(Criteria.where("assetCode").is(deviceId));
        asset = mongoTemplate.findOne(byCode, Document.class, ASSETS_COLLECTION);
        if (asset != null && !Boolean.FALSE.equals(asset.get("isActive")) && asset.get("assetCode") != null) {
            return String.valueOf(asset.get("assetCode"));
        }

        throw new BusinessException("No IIOT asset found for deviceId: " + deviceId);
    }

    private Document findAlarmEventById(String id) {
        Query byObjectId = new Query();
        if (ObjectId.isValid(id)) {
            byObjectId.addCriteria(Criteria.where("_id").is(new ObjectId(id)));
            Document doc = mongoTemplate.findOne(byObjectId, Document.class, ALARM_EVENTS_COLLECTION);
            if (doc != null) {
                return doc;
            }
        }

        Query byString = new Query(Criteria.where("_id").is(id));
        return mongoTemplate.findOne(byString, Document.class, ALARM_EVENTS_COLLECTION);
    }

    private Document requireActiveDocumentByBusinessKey(String collection, String key, String value) {
        Query query = new Query(Criteria.where(key).is(value));
        Document doc = mongoTemplate.findOne(query, Document.class, collection);
        if (doc == null || Boolean.FALSE.equals(doc.get("isActive"))) {
            throw new BusinessException("Resource not found: " + value);
        }
        return doc;
    }

    private Map<String, Object> reactivateDocumentByBusinessKey(String collection, String key, String value) {
        Query query = new Query(Criteria.where(key).is(value));
        Document doc = mongoTemplate.findOne(query, Document.class, collection);
        if (doc == null) {
            throw new BusinessException("Resource not found: " + value);
        }
        doc.put("isActive", true);
        doc.put("updatedAt", Date.from(Instant.now()));
        return toMap(mongoTemplate.save(doc, collection));
    }

    private Map<String, Object> insertDocument(Document document, String collectionName, String duplicateMessage) {
        try {
            return toMap(mongoTemplate.insert(document, collectionName));
        } catch (MongoWriteException ex) {
            if (ex.getError() != null && ex.getError().getCode() == 11000) {
                throw new BusinessException(duplicateMessage);
            }
            throw ex;
        }
    }

    private Map<String, Object> asMap(Object value) {
        if (value instanceof Map<?, ?> map) {
            Map<String, Object> normalized = new LinkedHashMap<>();
            map.forEach((k, v) -> normalized.put(String.valueOf(k), v));
            return normalized;
        }
        return Map.of();
    }

    private String requireText(Map<String, Object> request, String field) {
        String value = stringValue(request.get(field));
        if (value == null || value.isBlank()) {
            throw new BusinessException(field + " is required");
        }
        return value;
    }

    private String stringValue(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private String firstNonBlank(String primary, String fallback) {
        return primary == null || primary.isBlank() ? fallback : primary;
    }

    private void putIfPresent(Document doc, Map<String, Object> source, String key) {
        if (source.containsKey(key)) {
            doc.put(key, source.get(key));
        }
    }

    private Instant parseInstant(Object raw) {
        if (raw == null) {
            return Instant.now();
        }
        if (raw instanceof Number number) {
            long value = number.longValue();
            if (String.valueOf(value).length() >= 13) {
                return Instant.ofEpochMilli(value);
            }
            return Instant.ofEpochSecond(value);
        }
        if (raw instanceof Date date) {
            return date.toInstant();
        }
        String text = String.valueOf(raw);
        try {
            long numeric = Long.parseLong(text);
            if (text.length() >= 13) {
                return Instant.ofEpochMilli(numeric);
            }
            return Instant.ofEpochSecond(numeric);
        } catch (NumberFormatException ignore) {
            return Instant.parse(text);
        }
    }

    private Instant toInstant(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Date date) {
            return date.toInstant();
        }
        if (value instanceof Instant instant) {
            return instant;
        }
        try {
            return Instant.parse(String.valueOf(value));
        } catch (Exception ex) {
            return null;
        }
    }

    private Double toDouble(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number number) {
            return number.doubleValue();
        }
        try {
            return Double.parseDouble(String.valueOf(value));
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private double round4(double value) {
        return Math.round(value * 10000.0d) / 10000.0d;
    }

    private double clamp(double value) {
        if (value < 0d) {
            return 0d;
        }
        if (value > 1d) {
            return 1d;
        }
        return value;
    }

    private Object normalizeValue(Object value) {
        if (value instanceof Document nested) {
            return toMap(nested);
        }
        if (value instanceof List<?> list) {
            return list.stream().map(this::normalizeValue).toList();
        }
        if (value instanceof ObjectId objectId) {
            return objectId.toHexString();
        }
        if (value instanceof Date date) {
            return date.toInstant().toString();
        }
        if (value instanceof Instant instant) {
            return instant.toString();
        }
        return value;
    }

    private Map<String, Object> toMap(Document document) {
        Map<String, Object> result = new LinkedHashMap<>();
        for (Map.Entry<String, Object> entry : document.entrySet()) {
            result.put(entry.getKey(), normalizeValue(entry.getValue()));
        }
        return result;
    }
}