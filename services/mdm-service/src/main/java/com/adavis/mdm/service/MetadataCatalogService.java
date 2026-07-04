package com.adavis.mdm.service;

import lombok.RequiredArgsConstructor;
import org.bson.Document;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class MetadataCatalogService {

    private static final Set<String> RESPONSE_EXCLUDED_FIELDS = Set.of("_id", "id", "_description");
    private static final String MODULES_COLLECTION = "mdm_modules";
    private static final String SCREENS_COLLECTION = "mdm_screens";
    private static final String FEATURES_COLLECTION = "mdm_features";

    private final MongoTemplate mongoTemplate;

    public List<Map<String, Object>> getModules(Boolean isActive) {
        Query query = new Query();
        if (isActive == null) {
            query.addCriteria(Criteria.where("isActive").is(true));
        } else {
            query.addCriteria(Criteria.where("isActive").is(isActive));
        }
        query.with(Sort.by(Sort.Direction.ASC, "displayOrder", "moduleCode", "moduleId"));

        return mongoTemplate.find(query, Document.class, MODULES_COLLECTION)
            .stream()
            .map(this::sanitizeDocument)
            .toList();
    }

    public List<Map<String, Object>> getScreens(String moduleCode, Boolean isActive) {
        Query query = new Query();

        if (moduleCode != null && !moduleCode.isBlank()) {
            query.addCriteria(new Criteria().orOperator(
                    Criteria.where("moduleCode").is(moduleCode),
                    Criteria.where("moduleId").is(moduleCode)
            ));
        }

        if (isActive == null) {
            query.addCriteria(Criteria.where("isActive").is(true));
        } else {
            query.addCriteria(Criteria.where("isActive").is(isActive));
        }

        query.with(Sort.by(Sort.Direction.ASC, "displayOrder", "screenCode", "screenId"));

        return mongoTemplate.find(query, Document.class, SCREENS_COLLECTION)
            .stream()
            .map(this::sanitizeDocument)
            .toList();
    }

    public List<Map<String, Object>> getFeatures(String moduleCode, String screenCode, Boolean isActive) {
        Query query = new Query();

        if (moduleCode != null && !moduleCode.isBlank()) {
            query.addCriteria(new Criteria().orOperator(
                    Criteria.where("moduleCode").is(moduleCode),
                    Criteria.where("moduleId").is(moduleCode)
            ));
        }

        if (screenCode != null && !screenCode.isBlank()) {
            query.addCriteria(new Criteria().orOperator(
                    Criteria.where("screenCode").is(screenCode),
                    Criteria.where("screenId").is(screenCode)
            ));
        }

        if (isActive == null) {
            query.addCriteria(Criteria.where("isActive").is(true));
        } else {
            query.addCriteria(Criteria.where("isActive").is(isActive));
        }

        query.with(Sort.by(Sort.Direction.ASC, "displayOrder", "featureCode", "featureId"));

        return mongoTemplate.find(query, Document.class, FEATURES_COLLECTION)
                .stream()
                .map(this::sanitizeDocument)
                .toList();
    }

    public Map<String, Object> getPermissionMatrixTree(Boolean isActive) {
        List<Map<String, Object>> modules = getModules(isActive);
        List<Map<String, Object>> screens = getScreens(null, isActive);
        List<Map<String, Object>> features = getFeatures(null, null, isActive);

        Map<String, List<Map<String, Object>>> featuresByScreenId = new LinkedHashMap<>();
        for (Map<String, Object> feature : features) {
            String screenId = asText(feature.get("screenId"));
            if (screenId == null) {
                continue;
            }
            featuresByScreenId.computeIfAbsent(screenId, ignored -> new ArrayList<>())
                    .add(feature);
        }

        Map<String, List<Map<String, Object>>> screensByModuleId = new LinkedHashMap<>();
        for (Map<String, Object> screen : screens) {
            String screenId = asText(screen.get("screenId"));
            if (screenId != null) {
                screen.put("features", featuresByScreenId.getOrDefault(screenId, List.of()));
            }
            String moduleId = asText(screen.get("moduleId"));
            if (moduleId == null) {
                moduleId = asText(screen.get("moduleCode"));
            }
            if (moduleId == null) {
                continue;
            }
            screensByModuleId.computeIfAbsent(moduleId, ignored -> new ArrayList<>())
                    .add(screen);
        }

        List<Map<String, Object>> moduleTree = new ArrayList<>();
        for (Map<String, Object> module : modules) {
            String moduleId = asText(module.get("moduleId"));
            if (moduleId == null) {
                moduleId = asText(module.get("moduleCode"));
            }
            Map<String, Object> node = new LinkedHashMap<>(module);
            node.put("screens", screensByModuleId.getOrDefault(moduleId, List.of()));
            moduleTree.add(node);
        }

        return Map.of("modules", moduleTree);
    }

    private Map<String, Object> sanitizeDocument(Document document) {
        Map<String, Object> sanitized = new LinkedHashMap<>();
        for (Map.Entry<String, Object> entry : document.entrySet()) {
            String key = entry.getKey();
            if (RESPONSE_EXCLUDED_FIELDS.contains(key)) {
                continue;
            }
            sanitized.put(key, normalizeValue(entry.getValue()));
        }
        return sanitized;
    }

    private Object normalizeValue(Object value) {
        if (value instanceof Document nested) {
            return sanitizeDocument(nested);
        }
        if (value instanceof List<?> list) {
            return list.stream().map(this::normalizeValue).filter(Objects::nonNull).toList();
        }
        return value;
    }

    private String asText(Object value) {
        if (value == null) {
            return null;
        }
        String output = String.valueOf(value).trim();
        return output.isEmpty() ? null : output;
    }
}
