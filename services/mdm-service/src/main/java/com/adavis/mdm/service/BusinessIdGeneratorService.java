package com.adavis.mdm.service;

import lombok.RequiredArgsConstructor;
import org.bson.Document;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BusinessIdGeneratorService {

    private final MongoTemplate mongoTemplate;

    public String nextId(String collectionName, String fieldName, String prefix, int width) {
        int max = 0;
        for (Document document : mongoTemplate.findAll(Document.class, collectionName)) {
            Object rawValue = document.get(fieldName);
            if (rawValue == null) {
                continue;
            }

            int suffix = extractNumericSuffix(String.valueOf(rawValue), prefix);
            if (suffix > max) {
                max = suffix;
            }
        }

        return prefix + String.format("%0" + width + "d", max + 1);
    }

    private int extractNumericSuffix(String value, String prefix) {
        if (value == null || !value.startsWith(prefix)) {
            return -1;
        }

        String suffix = value.substring(prefix.length());
        if (!suffix.matches("\\d+")) {
            return -1;
        }

        try {
            return Integer.parseInt(suffix);
        } catch (NumberFormatException ex) {
            return -1;
        }
    }
}