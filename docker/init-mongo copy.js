// ============================================
// Adavis AI Platform - MongoDB Initialization Script
// Destructive reset: drops and recreates the application database on each run
// ============================================

// Use docker compose init database by default (adavis_platform).
var databaseName = 'adavis_platform';
if (typeof process !== 'undefined' && process.env && process.env.MONGO_INITDB_DATABASE) {
    databaseName = process.env.MONGO_INITDB_DATABASE;
}
db = db.getSiblingDB(databaseName);

var DEFAULT_ADAVIS_PASSWORD_HASH = '$2a$10$pzWt1lCtyuKoDTX3cv6ICOvlchKgpk/OAvzZXFbiT6HrodBFtyFxe';
var DEFAULT_PERMISSION_ACTIONS = ['READ', 'WRITE', 'REVIEW', 'APPROVE', 'DEACTIVATE'];

function ensureDatabaseReady() {
    try {
        db.runCommand({ ping: 1 });
    } catch (e) {
        print('[ERROR] MongoDB is not available. Cannot initialize database.');
        throw e;
    }
}

function now() {
    return new Date();
}

function logInfo(msg) {
    print('[INFO] ' + msg);
}

function resetApplicationDatabase() {
    try {
        db.dropDatabase();
        logInfo('Dropped application database: ' + databaseName);
    } catch (e) {
        print('[ERROR] Failed to drop application database: ' + databaseName);
        throw e;
    }
}

function ensureUser() {
    try {
        var existing = db.getUser('admin');
        if (!existing) {
            db.createUser({
                user: 'admin',
                pwd: 'Admin123!',
                roles: [{ role: 'root', db: 'admin' }]
            });
            logInfo('Admin user created');
        } else {
            logInfo('Admin user already exists');
        }
    } catch (e) {
        if (e.codeName === 'DuplicateKey' || e.codeName === 'Unauthorized') {
            logInfo('Admin user already exists or cannot be managed from this context');
        } else {
            throw e;
        }
    }
}

function buildCollectionOptions(defaultOptions, overrideOptions) {
    var merged = Object.assign({}, defaultOptions || {});
    if (overrideOptions) {
        for (var key in overrideOptions) {
            if (overrideOptions.hasOwnProperty(key)) {
                merged[key] = overrideOptions[key];
            }
        }
    }
    return merged;
}

function applyCollectionValidation(name, options) {
    if (!options || !options.validator) {
        return;
    }
    try {
        db.runCommand({
            collMod: name,
            validator: options.validator,
            validationLevel: options.validationLevel || 'moderate',
            validationAction: options.validationAction || 'error'
        });
        logInfo('Applied validator to collection: ' + name);
    } catch (e) {
        if (e.codeName === 'NamespaceNotFound') {
            return;
        }
        throw e;
    }
}

var collectionOptions = {
    mdm_tenants: {
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                required: ['tenantId', 'companyName', 'companyCode', 'isActive'],
                properties: {
                    tenantId: { bsonType: 'string' },
                    companyName: { bsonType: 'string' },
                    companyCode: { bsonType: 'string' },
                    isActive: { bsonType: 'bool' }
                }
            }
        },
        validationLevel: 'moderate',
        validationAction: 'error'
    },
    mdm_plants: {
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                required: ['plantId', 'tenantId', 'plantName', 'plantCode', 'isActive'],
                properties: {
                    plantId: { bsonType: 'string' },
                    tenantId: { bsonType: 'string' },
                    plantName: { bsonType: 'string' },
                    plantCode: { bsonType: 'string' },
                    isActive: { bsonType: 'bool' }
                }
            }
        }
    },
    mdm_blocks: {
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                required: ['tenantId', 'plantId', 'blockCode', 'blockName', 'isActive'],
                properties: {
                    tenantId: { bsonType: 'string' },
                    plantId: { bsonType: 'string' },
                    blockCode: { bsonType: 'string' },
                    blockName: { bsonType: 'string' },
                    isActive: { bsonType: 'bool' }
                }
            }
        }
    },
    mdm_areas: {
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                required: ['tenantId', 'plantId', 'blockId', 'areaCode', 'areaName', 'isActive'],
                properties: {
                    tenantId: { bsonType: 'string' },
                    plantId: { bsonType: 'string' },
                    blockId: {},
                    areaCode: { bsonType: 'string' },
                    areaName: { bsonType: 'string' },
                    isActive: { bsonType: 'bool' }
                }
            }
        }
    },
    mdm_rooms: {
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                required: ['roomId', 'tenantId', 'plantId', 'areaId', 'roomCode', 'roomName', 'isActive'],
                properties: {
                    roomId: { bsonType: 'string' },
                    tenantId: { bsonType: 'string' },
                    plantId: { bsonType: 'string' },
                    areaId: {},
                    roomCode: { bsonType: 'string' },
                    roomName: { bsonType: 'string' },
                    isActive: { bsonType: 'bool' }
                }
            }
        }
    },
    mdm_departments: {
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                required: ['departmentId', 'tenantId', 'plantId', 'departmentCode', 'departmentName', 'path', 'isActive'],
                properties: {
                    departmentId: { bsonType: 'string' },
                    tenantId: { bsonType: 'string' },
                    plantId: { bsonType: 'string' },
                    departmentCode: { bsonType: 'string' },
                    departmentName: { bsonType: 'string' },
                    path: { bsonType: 'string' },
                    isActive: { bsonType: 'bool' }
                }
            }
        }
    },
    mdm_user_profiles: {
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                required: ['userId', 'userTrackId', 'tenantId', 'firstName', 'lastName', 'email', 'isActive', 'isBlocked'],
                properties: {
                    userId: { bsonType: 'string' },
                    userTrackId: { bsonType: 'string' },
                    tenantId: { bsonType: 'string' },
                    firstName: { bsonType: 'string' },
                    lastName: { bsonType: 'string' },
                    email: { bsonType: 'string' },
                    phoneNumber: { bsonType: 'string' },
                    isActive: { bsonType: 'bool' },
                    isBlocked: { bsonType: 'bool' }
                }
            }
        }
    },
    auth_users: {
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                required: ['userId', 'status', 'isLocked', 'failedAttempts'],
                properties: {
                    userId: { bsonType: 'string' },
                    username: { bsonType: 'string' },
                    email: { bsonType: 'string' },
                    status: { bsonType: 'string' },
                    isLocked: { bsonType: 'bool' },
                    failedAttempts: { bsonType: ['int', 'long', 'double'] }
                }
            }
        }
    },
    mdm_user_auth_credentials: {
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                required: ['userId', 'passwordHash'],
                properties: {
                    userId: { bsonType: 'string' },
                    email: { bsonType: 'string' },
                    passwordHash: { bsonType: 'string' },
                    mustChangePassword: { bsonType: 'bool' },
                    passwordUpdatedAt: { bsonType: 'date' }
                }
            }
        }
    },
    mdm_password_policies: {
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                required: ['tenantId'],
                properties: {
                    tenantId: { bsonType: 'string' }
                }
            }
        }
    },
    mdm_system_config: {
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                required: ['configKey'],
                properties: {
                    configKey: { bsonType: 'string' },
                    tenantId: { bsonType: 'string' },
                    value: {},
                    isActive: { bsonType: 'bool' }
                }
            }
        }
    },
    mdm_user_groups: {
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                required: ['groupId', 'tenantId', 'groupCode', 'groupName', 'isActive'],
                properties: {
                    groupId: { bsonType: 'string' },
                    tenantId: { bsonType: 'string' },
                    groupCode: { bsonType: 'string' },
                    groupName: { bsonType: 'string' },
                    isActive: { bsonType: 'bool' }
                }
            }
        }
    },
    mdm_user_context_assignments: {
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                required: ['assignmentId', 'tenantId', 'userId', 'groupId', 'isActive'],
                properties: {
                    assignmentId: { bsonType: 'string' },
                    tenantId: { bsonType: 'string' },
                    userId: { bsonType: 'string' },
                    groupId: { bsonType: 'string' },
                    isActive: { bsonType: 'bool' }
                }
            }
        }
    },
    mdm_user_assignments_to_user_groups: {
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                required: ['userId', 'groupId', 'isActive', 'assignedAt', 'assignedBy'],
                properties: {
                    userId: { bsonType: 'string' },
                    groupId: { bsonType: 'string' },
                    isActive: { bsonType: 'bool' },
                    assignedAt: { bsonType: 'date' },
                    assignedBy: { bsonType: 'string' }
                }
            }
        }
    },
    mdm_role_assignments_to_user_groups: {
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                required: ['groupId', 'roleId', 'isActive', 'assignedAt', 'assignedBy'],
                properties: {
                    groupId: { bsonType: 'string' },
                    roleId: { bsonType: 'string' },
                    isActive: { bsonType: 'bool' },
                    assignedAt: { bsonType: 'date' },
                    assignedBy: { bsonType: 'string' }
                }
            }
        }
    },
    mdm_user_sessions: {
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                required: ['userId', 'refreshToken', 'expiresAt', 'isActive'],
                properties: {
                    sessionId: { bsonType: 'string' },
                    tenantId: { bsonType: 'string' },
                    userId: { bsonType: 'string' },
                    refreshToken: { bsonType: 'string' },
                    deviceInfo: { bsonType: 'string' },
                    ipAddress: { bsonType: 'string' },
                    expiresAt: { bsonType: 'date' },
                    lastActivityAt: { bsonType: 'date' },
                    isActive: { bsonType: 'bool' }
                }
            }
        }
    },
    login_history: {
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                required: ['tenantId', 'userId', 'status', 'timestamp'],
                properties: {
                    tenantId: { bsonType: 'string' },
                    userId: { bsonType: 'string' },
                    status: { bsonType: 'string' },
                    timestamp: { bsonType: 'date' }
                }
            }
        }
    },
    mdm_roles: {
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                required: ['roleId', 'tenantId', 'roleCode', 'roleName', 'isActive'],
                properties: {
                    roleId: { bsonType: 'string' },
                    tenantId: { bsonType: 'string' },
                    roleCode: { bsonType: 'string' },
                    roleName: { bsonType: 'string' },
                    isActive: { bsonType: 'bool' }
                }
            }
        }
    },
    mdm_modules: {
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                required: ['moduleId', 'moduleCode', 'moduleName', 'displayOrder', 'isActive'],
                properties: {
                    moduleId: { bsonType: 'string' },
                    moduleCode: { bsonType: 'string' },
                    moduleName: { bsonType: 'string' },
                    displayOrder: { bsonType: ['int', 'long', 'double'] },
                    isActive: { bsonType: 'bool' }
                }
            }
        }
    },
    mdm_screens: {
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                required: ['screenId', 'moduleId', 'moduleCode', 'screenCode', 'screenName', 'displayOrder', 'isActive'],
                properties: {
                    screenId: { bsonType: 'string' },
                    moduleId: { bsonType: 'string' },
                    moduleCode: { bsonType: 'string' },
                    screenCode: { bsonType: 'string' },
                    screenName: { bsonType: 'string' },
                    displayOrder: { bsonType: ['int', 'long', 'double'] },
                    isActive: { bsonType: 'bool' }
                }
            }
        }
    },
    mdm_features: {
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                required: ['featureId', 'moduleId', 'moduleCode', 'screenId', 'screenCode', 'featureCode', 'featureName', 'displayOrder', 'isActive'],
                properties: {
                    featureId: { bsonType: 'string' },
                    moduleId: { bsonType: 'string' },
                    moduleCode: { bsonType: 'string' },
                    screenId: { bsonType: 'string' },
                    screenCode: { bsonType: 'string' },
                    featureCode: { bsonType: 'string' },
                    featureName: { bsonType: 'string' },
                    displayOrder: { bsonType: ['int', 'long', 'double'] },
                    isActive: { bsonType: 'bool' }
                }
            }
        }
    },
    mdm_role_permissions: {
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                required: ['roleId', 'moduleId', 'version', 'isActive', 'screenPermissions'],
                properties: {
                    tenantId: { bsonType: 'string' },
                    roleId: { bsonType: 'string' },
                    moduleId: { bsonType: 'string' },
                    version: { bsonType: ['int', 'long', 'double'] },
                    isActive: { bsonType: 'bool' },
                    effectiveFrom: { bsonType: 'date' },
                    screenPermissions: {
                        bsonType: 'array'
                    }
                }
            }
        }
    },
    iiot_assets: {
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                required: ['assetId', 'tenantId', 'plantId', 'roomId', 'assetCode', 'assetName', 'isActive'],
                properties: {
                    assetId: { bsonType: 'string' },
                    tenantId: { bsonType: 'string' },
                    plantId: { bsonType: 'string' },
                    roomId: {},
                    assetCode: { bsonType: 'string' },
                    assetName: { bsonType: 'string' },
                    isActive: { bsonType: 'bool' }
                }
            }
        }
    },
    iiot_asset_tags: {
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                required: ['tagId', 'tenantId', 'assetId', 'assetCode', 'tagCode', 'tagName', 'isActive'],
                properties: {
                    tagId: { bsonType: 'string' },
                    tenantId: { bsonType: 'string' },
                    assetId: {},
                    assetCode: { bsonType: 'string' },
                    tagCode: { bsonType: 'string' },
                    tagName: { bsonType: 'string' },
                    isActive: { bsonType: 'bool' }
                }
            }
        }
    },
    iiot_tag_thresholds: {
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                required: ['thresholdId', 'tenantId', 'plantId', 'assetId', 'tagId', 'tagCode', 'condition', 'isActive'],
                properties: {
                    thresholdId: { bsonType: 'string' },
                    tenantId: { bsonType: 'string' },
                    plantId: { bsonType: 'string' },
                    assetId: {},
                    tagId: {},
                    tagCode: { bsonType: 'string' },
                    condition: { bsonType: 'string' },
                    isActive: { bsonType: 'bool' }
                }
            }
        }
    },
    iiot_asset_states: {
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                required: ['assetId', 'tagCode', 'timestamp'],
                properties: {
                    assetId: { bsonType: 'string' },
                    tagCode: { bsonType: 'string' },
                    timestamp: { bsonType: 'date' }
                }
            }
        }
    },
    mdm_licenses: {
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                required: ['tenantId', 'modules', 'maxUsers', 'currentUsers', 'status', 'isDeleted'],
                properties: {
                    tenantId: { bsonType: 'string' },
                    licenseKey: { bsonType: 'string' },
                    modules: { bsonType: 'array' },
                    maxUsers: { bsonType: ['int', 'long', 'double'] },
                    currentUsers: { bsonType: ['int', 'long', 'double'] },
                    status: { bsonType: 'string' },
                    isDeleted: { bsonType: 'bool' }
                }
            }
        }
    },
    mdm_licence_history: {
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                required: ['tenantId', 'action', 'performedAt'],
                properties: {
                    tenantId: { bsonType: 'string' },
                    licenseId: { bsonType: 'string' },
                    action: { bsonType: 'string' },
                    beforeStatus: { bsonType: 'string' },
                    afterStatus: { bsonType: 'string' },
                    beforeMaxUsers: { bsonType: ['int', 'long', 'double'] },
                    afterMaxUsers: { bsonType: ['int', 'long', 'double'] },
                    beforeModules: { bsonType: 'array' },
                    afterModules: { bsonType: 'array' },
                    beforeExpiry: { bsonType: 'date' },
                    afterExpiry: { bsonType: 'date' },
                    reason: { bsonType: 'string' },
                    performedBy: { bsonType: 'string' },
                    performedAt: { bsonType: 'date' }
                }
            }
        }
    },
    dms_documents: {
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                required: ['documentId', 'tenantId'],
                properties: {
                    documentId: { bsonType: 'string' },
                    tenantId: { bsonType: 'string' }
                }
            }
        }
    },
    mdm_audit_trails: {
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                required: ['action', 'timestamp'],
                properties: {
                    tenantId: { bsonType: 'string' },
                    userId: { bsonType: 'string' },
                    action: { bsonType: 'string' },
                    timestamp: { bsonType: 'date' }
                }
            }
        }
    },
    id_sequences: {
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                required: ['sequenceName', 'currentValue'],
                properties: {
                    sequenceName: { bsonType: 'string' },
                    currentValue: { bsonType: ['int', 'long', 'double'] }
                }
            }
        }
    },
    id_sequence_mappings: {
        validator: {
            $jsonSchema: {
                bsonType: 'object',
                required: ['sequenceName', 'collectionName', 'fieldName', 'prefix', 'padLength', 'isActive'],
                properties: {
                    sequenceName: { bsonType: 'string' },
                    collectionName: { bsonType: 'string' },
                    fieldName: { bsonType: 'string' },
                    prefix: { bsonType: 'string' },
                    padLength: { bsonType: ['int', 'long', 'double'] },
                    isActive: { bsonType: 'bool' }
                }
            }
        }
    }
};

function ensureCollection(name, options) {
    var effectiveOptions = buildCollectionOptions(collectionOptions[name], options);
    if (db.getCollectionNames().indexOf(name) === -1) {
        db.createCollection(name, effectiveOptions || {});
        logInfo('Created collection: ' + name);
        return;
    }
    applyCollectionValidation(name, effectiveOptions);
}

function ensureIndex(collectionName, spec, options) {
    try {
        db.getCollection(collectionName).createIndex(spec, options || {});
    } catch (e) {
        if (e.codeName === 'IndexOptionsConflict' || e.codeName === 'IndexKeySpecsConflict') {
            logInfo('Index already exists with different options on ' + collectionName + ', skipping');
        } else {
            throw e;
        }
    }
}

function dropIndexIfExists(collectionName, indexName) {
    try {
        var indexes = db.getCollection(collectionName).getIndexes();
        for (var i = 0; i < indexes.length; i++) {
            if (indexes[i].name === indexName) {
                db.getCollection(collectionName).dropIndex(indexName);
                logInfo('Dropped index: ' + collectionName + '.' + indexName);
                return;
            }
        }
    } catch (e) {
        if (e.codeName === 'NamespaceNotFound' || e.codeName === 'IndexNotFound') {
            return;
        }
        throw e;
    }
}

function withTimestamps(doc) {
    var out = Object.assign({}, doc);
    if (!out.createdAt) {
        out.createdAt = now();
    }
    out.updatedAt = now();
    return out;
}

function upsertOne(collectionName, filter, doc) {
    var payload = withTimestamps(doc);
    var setPayload = Object.assign({}, payload);
    delete setPayload.createdAt;
    db.getCollection(collectionName).updateOne(
        filter,
        {
            $set: setPayload,
            $setOnInsert: { createdAt: payload.createdAt }
        },
        { upsert: true }
    );
}

function upsertMany(collectionName, items, keyField) {
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var key = item[keyField];
        if (key === undefined || key === null) {
            continue;
        }
        var filter = {};
        filter[keyField] = key;
        upsertOne(collectionName, filter, item);
    }
}

function upsertManyWithAutoId(collectionName, items, keyField, sequenceConfig) {
    for (var i = 0; i < items.length; i++) {
        var item = Object.assign({}, items[i]);
        if ((item[keyField] === undefined || item[keyField] === null || item[keyField] === '') && sequenceConfig) {
            item[keyField] = nextBusinessId(
                sequenceConfig.sequenceName,
                sequenceConfig.prefix,
                sequenceConfig.padLength || 4
            );
        }

        var key = item[keyField];
        if (key === undefined || key === null || key === '') {
            continue;
        }

        var filter = {};
        filter[keyField] = key;
        upsertOne(collectionName, filter, item);
    }
}

function parseNumericSuffix(value, prefix) {
    if (!value || typeof value !== 'string') {
        return -1;
    }
    var pattern = new RegExp('^' + prefix + '-(\\d+)$');
    var match = value.match(pattern);
    if (!match || match.length < 2) {
        return -1;
    }
    return parseInt(match[1], 10);
}

function toPaddedId(prefix, numberValue, padLength) {
    var num = Number(numberValue || 0);
    var numStr = String(num);
    while (numStr.length < padLength) {
        numStr = '0' + numStr;
    }
    return prefix + '-' + numStr;
}

function nextSequenceValue(sequenceName) {
    db.getCollection('id_sequences').updateOne(
        { sequenceName: sequenceName },
        {
            $inc: { currentValue: 1 },
            $set: { updatedAt: now() },
            $setOnInsert: { createdAt: now() }
        },
        { upsert: true }
    );
    var current = db.getCollection('id_sequences').findOne({ sequenceName: sequenceName });
    return current && current.currentValue ? current.currentValue : 1;
}

function nextBusinessId(sequenceName, prefix, padLength) {
    return toPaddedId(prefix, nextSequenceValue(sequenceName), padLength || 4);
}

function initializeSequence(def) {
    var sequenceName = def.sequenceName;
    var collectionName = def.collectionName;
    var fieldName = def.fieldName;
    var prefix = def.prefix;
    var padLength = def.padLength || 4;

    var currentMax = 0;
    var projection = {};
    projection[fieldName] = 1;
    db.getCollection(collectionName)
        .find({}, projection)
        .forEach(function (doc) {
            var candidate = parseNumericSuffix(doc[fieldName], prefix);
            if (candidate > currentMax) {
                currentMax = candidate;
            }
        });

    if (def.seedValues && def.seedValues.length > 0) {
        for (var i = 0; i < def.seedValues.length; i++) {
            var seededCandidate = parseNumericSuffix(def.seedValues[i], prefix);
            if (seededCandidate > currentMax) {
                currentMax = seededCandidate;
            }
        }
    }

    upsertOne('id_sequence_mappings', { sequenceName: sequenceName }, {
        sequenceName: sequenceName,
        collectionName: collectionName,
        fieldName: fieldName,
        prefix: prefix,
        padLength: padLength,
        sampleNextValue: toPaddedId(prefix, currentMax + 1, padLength),
        isActive: true
    });

    db.getCollection('id_sequences').updateOne(
        { sequenceName: sequenceName },
        {
            $set: {
                sequenceName: sequenceName,
                collectionName: collectionName,
                fieldName: fieldName,
                prefix: prefix,
                padLength: padLength,
                currentValue: currentMax,
                updatedAt: now()
            },
            $setOnInsert: {
                createdAt: now()
            }
        },
        { upsert: true }
    );
}

function buildRolePermissionDocument(tenantId, roleId, moduleId, screens, features) {
    var screenPermissions = [];
    for (var i = 0; i < screens.length; i++) {
        var screen = screens[i];
        if (screen.moduleId !== moduleId) {
            continue;
        }
        var featurePermissions = [];
        for (var j = 0; j < features.length; j++) {
            var feature = features[j];
            if (feature.screenId === screen.screenId) {
                featurePermissions.push({
                    featureId: feature.featureId,
                    actions: DEFAULT_PERMISSION_ACTIONS
                });
            }
        }
        screenPermissions.push({
            screenId: screen.screenId,
            actions: DEFAULT_PERMISSION_ACTIONS,
            featurePermissions: featurePermissions
        });
    }

    return {
        tenantId: tenantId,
        roleId: roleId,
        moduleId: moduleId,
        version: 1,
        isActive: true,
        effectiveFrom: ISODate('2026-03-01T00:00:00Z'),
        effectiveTo: null,
        screenPermissions: screenPermissions
    };
}

print('========================================');
print('Initializing Adavis Platform Database');
print('========================================');
print('Target database: ' + databaseName);

ensureDatabaseReady();
resetApplicationDatabase();
ensureUser();

var collections = [
    'mdm_tenants',
    'mdm_plants',
    'mdm_blocks',
    'mdm_areas',
    'mdm_rooms',
    'mdm_departments',
    'mdm_user_profiles',
    'auth_users',
    'mdm_user_auth_credentials',
    'mdm_password_policies',
    'mdm_system_config',
    'mdm_user_groups',
    'mdm_user_context_assignments',
    'mdm_user_sessions',
    'login_history',
    'mdm_roles',
    'mdm_modules',
    'mdm_screens',
    'mdm_features',
    'mdm_role_permissions',
    'mdm_user_assignments_to_user_groups',
    'mdm_role_assignments_to_user_groups',
    'iiot_assets',
    'iiot_asset_tags',
    'iiot_tag_thresholds',
    'iiot_asset_states',
    'mdm_licenses',
    'mdm_licence_history',
    'dms_documents',
    'mdm_audit_trails',
    'id_sequences',
    'id_sequence_mappings'
];

for (var c = 0; c < collections.length; c++) {
    ensureCollection(collections[c]);
}

// sample_collections defines iiot_telemetry as time-series style
ensureCollection('iiot_telemetry', {
    timeseries: {
        timeField: 'timestamp',
        metaField: 'metaField',
        granularity: 'seconds'
    }
});

logInfo('Creating indexes...');

ensureIndex('mdm_tenants', { tenantId: 1 }, { unique: true });
dropIndexIfExists('mdm_tenants', 'domain_1');
ensureIndex('mdm_tenants', { domain: 1 }, {
    unique: true,
    partialFilterExpression: {
        domain: { $exists: true, $type: 'string', $gt: '' }
    }
});
dropIndexIfExists('mdm_tenants', 'companyCode_1');
ensureIndex('mdm_tenants', { companyCode: 1 }, {
    unique: true,
    partialFilterExpression: {
        companyCode: { $exists: true, $type: 'string', $gt: '' }
    }
});

ensureIndex('mdm_plants', { plantId: 1 }, { unique: true });
ensureIndex('mdm_plants', { tenantId: 1, plantCode: 1 }, { unique: true });

ensureIndex('mdm_blocks', { tenantId: 1, blockCode: 1 }, { unique: true });
ensureIndex('mdm_areas', { tenantId: 1, areaCode: 1 }, { unique: true });
ensureIndex('mdm_areas', { blockId: 1 });
ensureIndex('mdm_rooms', { tenantId: 1, roomCode: 1 }, { unique: true });
ensureIndex('mdm_rooms', { areaId: 1 });

ensureIndex('auth_users', { userId: 1 }, { unique: true });
dropIndexIfExists('auth_users', 'username_1');
ensureIndex('auth_users', { username: 1 }, {
    unique: true,
    partialFilterExpression: {
        username: { $exists: true, $type: 'string', $gt: '' }
    }
});
dropIndexIfExists('auth_users', 'email_1');
ensureIndex('auth_users', { email: 1 }, {
    unique: true,
    partialFilterExpression: {
        email: { $exists: true, $type: 'string', $gt: '' }
    }
});

ensureIndex('mdm_user_auth_credentials', { userId: 1 }, { unique: true });
ensureIndex('mdm_user_auth_credentials', { email: 1 });

ensureIndex('mdm_password_policies', { tenantId: 1 }, { unique: true });

dropIndexIfExists('mdm_system_config', 'configKey_1_tenantId_1');
ensureIndex('mdm_system_config', { configKey: 1, tenantId: 1 }, {
    unique: true,
    partialFilterExpression: {
        tenantId: { $exists: true, $type: 'string', $gt: '' }
    }
});

ensureIndex('mdm_user_groups', { groupId: 1 }, { unique: true });
ensureIndex('mdm_user_groups', { tenantId: 1, groupCode: 1 }, { unique: true });
ensureIndex('mdm_user_groups', { tenantId: 1 });

ensureIndex('mdm_user_context_assignments', { assignmentId: 1 }, { unique: true });
dropIndexIfExists('mdm_user_context_assignments', 'tenantId_1_userId_1_plantId_1_departmentId_1_groupId_1');
ensureIndex('mdm_user_context_assignments', { tenantId: 1, userId: 1, plantId: 1, departmentId: 1, groupId: 1 });
ensureIndex('mdm_user_context_assignments', { plantId: 1, departmentId: 1 });

ensureIndex('mdm_user_assignments_to_user_groups', { userId: 1, groupId: 1 }, { unique: true });
ensureIndex('mdm_user_assignments_to_user_groups', { userId: 1 });
ensureIndex('mdm_user_assignments_to_user_groups', { groupId: 1 });

ensureIndex('mdm_role_assignments_to_user_groups', { groupId: 1, roleId: 1 }, { unique: true });
ensureIndex('mdm_role_assignments_to_user_groups', { groupId: 1 });
ensureIndex('mdm_role_assignments_to_user_groups', { roleId: 1 });

dropIndexIfExists('mdm_user_sessions', 'sessionId_1');
ensureIndex('mdm_user_sessions', { refreshToken: 1 }, { unique: true });
ensureIndex('mdm_user_sessions', { userId: 1, isActive: 1 });
ensureIndex('mdm_user_sessions', { isActive: 1, expiresAt: 1 });
ensureIndex('mdm_user_sessions', { expiresAt: 1 }, { expireAfterSeconds: 0 });

ensureIndex('login_history', { tenantId: 1, userId: 1, timestamp: -1 });
ensureIndex('login_history', { tenantId: 1, status: 1, timestamp: -1 });

ensureIndex('mdm_roles', { roleId: 1 }, { unique: true });
dropIndexIfExists('mdm_roles', 'tenantId_1_roleCode_1');
ensureIndex('mdm_roles', { tenantId: 1, roleCode: 1 }, {
    unique: true,
    partialFilterExpression: {
        roleCode: { $exists: true, $type: 'string', $gt: '' }
    }
});
ensureIndex('mdm_roles', { tenantId: 1 });

ensureIndex('mdm_modules', { moduleId: 1 }, { unique: true });
ensureIndex('mdm_modules', { moduleCode: 1 }, { unique: true });

ensureIndex('mdm_screens', { screenId: 1 }, { unique: true });
ensureIndex('mdm_screens', { screenCode: 1 }, { unique: true });
ensureIndex('mdm_screens', { moduleId: 1 });
ensureIndex('mdm_screens', { moduleCode: 1 });

ensureIndex('mdm_features', { featureId: 1 }, { unique: true });
ensureIndex('mdm_features', { featureCode: 1 }, { unique: true });
ensureIndex('mdm_features', { screenId: 1 });
ensureIndex('mdm_features', { moduleCode: 1, screenCode: 1 });

ensureIndex('mdm_role_permissions', { roleId: 1 });
ensureIndex('mdm_role_permissions', { moduleId: 1 });
ensureIndex('mdm_role_permissions', { roleId: 1, moduleId: 1, version: 1 }, { unique: true });

ensureIndex('iiot_assets', { tenantId: 1, assetCode: 1 }, { unique: true });
ensureIndex('iiot_asset_tags', { tenantId: 1, assetCode: 1, tagCode: 1 }, { unique: true });
ensureIndex('iiot_tag_thresholds', { tenantId: 1, plantId: 1, thresholdId: 1 }, { unique: true });
ensureIndex('iiot_asset_states', { assetId: 1, tagCode: 1 }, { unique: true });
ensureIndex('iiot_asset_states', { timestamp: -1 });
ensureIndex('iiot_telemetry', { 'metaField.tenantId': 1, 'metaField.tagId': 1, timestamp: -1 });

dropIndexIfExists('mdm_licenses', 'tenantId_1');
dropIndexIfExists('mdm_licenses', 'licenseKey_1');
ensureIndex('mdm_licenses', { tenantId: 1 }, { unique: true });
ensureIndex('mdm_licenses', { licenseKey: 1 }, {
    unique: true,
    partialFilterExpression: {
        licenseKey: { $exists: true, $type: 'string', $gt: '' }
    }
});
ensureIndex('mdm_licence_history', { tenantId: 1, timestamp: -1 });

ensureIndex('dms_documents', { documentId: 1 }, { unique: true });
ensureIndex('dms_documents', { tenantId: 1, plantId: 1 });
ensureIndex('dms_documents', { sha256Checksum: 1 });

ensureIndex('mdm_audit_trails', { tenantId: 1, plantId: 1, action: 1, timestamp: -1 });
ensureIndex('mdm_audit_trails', { tenantId: 1, userId: 1, timestamp: -1 });

ensureIndex('mdm_user_profiles', { userId: 1 }, { unique: true });
ensureIndex('mdm_user_profiles', { userTrackId: 1 }, { unique: true });
dropIndexIfExists('mdm_user_profiles', 'username_1');
ensureIndex('mdm_user_profiles', { username: 1 }, {
    unique: true,
    partialFilterExpression: {
        username: { $exists: true, $type: 'string', $gt: '' }
    }
});
dropIndexIfExists('mdm_user_profiles', 'email_1');
ensureIndex('mdm_user_profiles', { email: 1 }, {
    unique: true,
    partialFilterExpression: {
        email: { $exists: true, $type: 'string', $gt: '' }
    }
});
ensureIndex('mdm_user_profiles', { tenantId: 1 });
ensureIndex('mdm_user_profiles', { tenantId: 1, userId: 1 }, { unique: true });

ensureIndex('mdm_departments', { departmentId: 1 }, { unique: true });
ensureIndex('mdm_departments', { tenantId: 1, plantId: 1, departmentCode: 1 }, { unique: true });
ensureIndex('mdm_departments', { parentDepartmentId: 1 });
ensureIndex('mdm_departments', { path: 1 });
ensureIndex('mdm_departments', { isActive: 1 });

ensureIndex('id_sequences', { sequenceName: 1 }, { unique: true });
ensureIndex('id_sequence_mappings', { sequenceName: 1 }, { unique: true });
ensureIndex('id_sequence_mappings', { collectionName: 1, fieldName: 1 }, { unique: true });

logInfo('Seeding default data...');

// Minimal default bootstrap only.
upsertOne('mdm_user_profiles', { userId: 'SUPER_ADMIN' }, {
    userTrackId: 'USR-0001',
    tenantId: 'TNT-0001',
    firstName: 'System',
    lastName: 'Administrator',
    phoneNumber: '+91-9000000001',
    title: 'Platform Super Administrator',
    userType: 'INTERNAL_EMPLOYEE',
    email: 'super_admin@adavis.com',
    empId: 'EMP-00001',
    isActive: true,
    isBlocked: false,
    createdAt: ISODate('2026-03-01T10:00:00Z'),
    updatedAt: ISODate()
});

upsertOne('auth_users', { userId: 'SUPER_ADMIN' }, {
    email: 'super_admin@adavis.com',
    status: 'ACTIVE',
    isLocked: false,
    failedAttempts: 0,
    createdAt: ISODate('2026-03-01T10:00:00Z'),
    updatedAt: ISODate()
});

upsertOne('mdm_user_auth_credentials', { userId: 'SUPER_ADMIN' }, {
    email: 'super_admin@adavis.com',
    passwordHash: DEFAULT_ADAVIS_PASSWORD_HASH,
    mustChangePassword: true,
    passwordUpdatedAt: ISODate(),
    createdAt: ISODate('2026-03-01T10:05:00Z'),
    updatedAt: ISODate()
});

upsertOne('mdm_system_config', { configKey: 'PASSWORD_POLICY_DEFAULT', tenantId: 'TNT-0001' }, {
    configKey: 'PASSWORD_POLICY_DEFAULT',
    tenantId: 'TNT-0001',
    value: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChar: true
    },
    isActive: true,
    createdAt: ISODate('2026-03-01T10:00:00Z'),
    updatedAt: ISODate()
});

var roleSeed = [
    {
        roleId: 'ROLE-0001',
        tenantId: 'TNT-0001',
        roleName: 'Platform Super Administrator',
        roleCode: 'SUPER_ADMIN',
        isActive: true,
        createdAt: ISODate('2026-01-20T10:30:00Z')
    }
];
upsertManyWithAutoId('mdm_roles', roleSeed, 'roleId', { sequenceName: 'roleId', prefix: 'ROLE', padLength: 4 });

var superAdminRole = db.mdm_roles.findOne({ tenantId: 'TNT-0001', roleCode: 'SUPER_ADMIN' });
var superAdminRoleId = superAdminRole && superAdminRole.roleId ? superAdminRole.roleId : 'ROLE-0001';

var groupSeed = [
    {
        groupId: 'GRP-0001',
        tenantId: 'TNT-0001',
        groupName: 'Platform Administrators',
        groupCode: 'PLATFORM_ADMIN',
        isActive: true,
        createdAt: ISODate('2026-01-20T11:00:00Z')
    }
];
upsertManyWithAutoId('mdm_user_groups', groupSeed, 'groupId', { sequenceName: 'groupId', prefix: 'GRP', padLength: 4 });

var platformAdminGroup = db.mdm_user_groups.findOne({ tenantId: 'TNT-0001', groupCode: 'PLATFORM_ADMIN' });
var platformAdminGroupId = platformAdminGroup && platformAdminGroup.groupId ? platformAdminGroup.groupId : 'GRP-0001';

var moduleSeed = [
    { moduleId: 'MOD-0001', moduleCode: 'MOD-MDM', moduleName: 'Master Data Management', displayOrder: 1, isActive: true },
    { moduleId: 'MOD-0002', moduleCode: 'MOD-IIOT', moduleName: 'IIOT Data Management', displayOrder: 2, isActive: true },
    { moduleId: 'MOD-0003', moduleCode: 'MOD-DMS', moduleName: 'Data Management System', displayOrder: 3, isActive: true }
];
upsertManyWithAutoId('mdm_modules', moduleSeed, 'moduleId', { sequenceName: 'moduleId', prefix: 'MOD', padLength: 4 });

var screenSeed = [
    { screenId: 'SCR-0001', moduleId: 'MOD-0001', moduleCode: 'MOD-MDM', screenCode: 'SCR-MDM-DASHBOARD', screenName: 'Dashboard', displayOrder: 1, isActive: true },
    { screenId: 'SCR-0002', moduleId: 'MOD-0001', moduleCode: 'MOD-MDM', screenCode: 'SCR-MDM-TENANT-LICENSE', screenName: 'Tenant & License Governance', displayOrder: 2, isActive: true },
    { screenId: 'SCR-0003', moduleId: 'MOD-0001', moduleCode: 'MOD-MDM', screenCode: 'SCR-MDM-PLANT-TOPOLOGY', screenName: 'Plant Topology', displayOrder: 3, isActive: true },
    { screenId: 'SCR-0004', moduleId: 'MOD-0001', moduleCode: 'MOD-MDM', screenCode: 'SCR-MDM-DEPARTMENT', screenName: 'Department', displayOrder: 4, isActive: true },
    { screenId: 'SCR-0005', moduleId: 'MOD-0001', moduleCode: 'MOD-MDM', screenCode: 'SCR-MDM-USER-ROLE-GROUPS', screenName: 'User, Role & Groups Management', displayOrder: 5, isActive: true },
    { screenId: 'SCR-0006', moduleId: 'MOD-0001', moduleCode: 'MOD-MDM', screenCode: 'SCR-MDM-IIOT-MASTER', screenName: 'IIOT Master Data Management', displayOrder: 6, isActive: true },
    { screenId: 'SCR-0007', moduleId: 'MOD-0001', moduleCode: 'MOD-MDM', screenCode: 'SCR-MDM-AUDIT-REPORTING', screenName: 'Audit & Reporting', displayOrder: 7, isActive: true },
    { screenId: 'SCR-0008', moduleId: 'MOD-0002', moduleCode: 'MOD-IIOT', screenCode: 'SCR-IIOT-EQUIPMENT-OVERVIEW', screenName: 'Equipment Overview', displayOrder: 1, isActive: true },
    { screenId: 'SCR-0009', moduleId: 'MOD-0002', moduleCode: 'MOD-IIOT', screenCode: 'SCR-IIOT-MONITORING-CONSOLE', screenName: 'Monitoring Console', displayOrder: 2, isActive: true },
    { screenId: 'SCR-0010', moduleId: 'MOD-0002', moduleCode: 'MOD-IIOT', screenCode: 'SCR-IIOT-ANALYTICS-OEE', screenName: 'Analytics OEE', displayOrder: 3, isActive: true }
];
upsertManyWithAutoId('mdm_screens', screenSeed, 'screenId', { sequenceName: 'screenId', prefix: 'SCR', padLength: 4 });

var featureSeed = [
    { featureId: 'FEAT-0001', moduleId: 'MOD-0001', moduleCode: 'MOD-MDM', screenId: 'SCR-0001', screenCode: 'SCR-MDM-DASHBOARD', featureCode: 'FEAT-MDM-DASHBOARD-OVERVIEW', featureName: 'Overview', displayOrder: 1, isActive: true },
    { featureId: 'FEAT-0002', moduleId: 'MOD-0001', moduleCode: 'MOD-MDM', screenId: 'SCR-0002', screenCode: 'SCR-MDM-TENANT-LICENSE', featureCode: 'FEAT-MDM-MANAGE-TENANT', featureName: 'Manage Tenant', displayOrder: 1, isActive: true },
    { featureId: 'FEAT-0003', moduleId: 'MOD-0001', moduleCode: 'MOD-MDM', screenId: 'SCR-0002', screenCode: 'SCR-MDM-TENANT-LICENSE', featureCode: 'FEAT-MDM-MANAGE-LICENSE', featureName: 'Manage License', displayOrder: 2, isActive: true },
    { featureId: 'FEAT-0004', moduleId: 'MOD-0001', moduleCode: 'MOD-MDM', screenId: 'SCR-0003', screenCode: 'SCR-MDM-PLANT-TOPOLOGY', featureCode: 'FEAT-MDM-MANAGE-PLANTS', featureName: 'Manage Plants', displayOrder: 1, isActive: true },
    { featureId: 'FEAT-0005', moduleId: 'MOD-0001', moduleCode: 'MOD-MDM', screenId: 'SCR-0003', screenCode: 'SCR-MDM-PLANT-TOPOLOGY', featureCode: 'FEAT-MDM-MANAGE-BUILDINGS', featureName: 'Manage Buildings', displayOrder: 2, isActive: true },
    { featureId: 'FEAT-0006', moduleId: 'MOD-0001', moduleCode: 'MOD-MDM', screenId: 'SCR-0003', screenCode: 'SCR-MDM-PLANT-TOPOLOGY', featureCode: 'FEAT-MDM-MANAGE-AREAS', featureName: 'Manage Areas', displayOrder: 3, isActive: true },
    { featureId: 'FEAT-0007', moduleId: 'MOD-0001', moduleCode: 'MOD-MDM', screenId: 'SCR-0003', screenCode: 'SCR-MDM-PLANT-TOPOLOGY', featureCode: 'FEAT-MDM-MANAGE-ROOMS', featureName: 'Manage Rooms', displayOrder: 4, isActive: true },
    { featureId: 'FEAT-0008', moduleId: 'MOD-0001', moduleCode: 'MOD-MDM', screenId: 'SCR-0004', screenCode: 'SCR-MDM-DEPARTMENT', featureCode: 'FEAT-MDM-MANAGE-DEPARTMENTS', featureName: 'Manage Departments', displayOrder: 1, isActive: true },
    { featureId: 'FEAT-0009', moduleId: 'MOD-0001', moduleCode: 'MOD-MDM', screenId: 'SCR-0005', screenCode: 'SCR-MDM-USER-ROLE-GROUPS', featureCode: 'FEAT-MDM-MANAGE-USERS', featureName: 'Manage Users', displayOrder: 1, isActive: true },
    { featureId: 'FEAT-0010', moduleId: 'MOD-0001', moduleCode: 'MOD-MDM', screenId: 'SCR-0005', screenCode: 'SCR-MDM-USER-ROLE-GROUPS', featureCode: 'FEAT-MDM-MANAGE-ROLES', featureName: 'Manage Roles', displayOrder: 2, isActive: true },
    { featureId: 'FEAT-0011', moduleId: 'MOD-0001', moduleCode: 'MOD-MDM', screenId: 'SCR-0005', screenCode: 'SCR-MDM-USER-ROLE-GROUPS', featureCode: 'FEAT-MDM-MANAGE-ROLE-PERMISSIONS', featureName: 'Manage Role Permissions', displayOrder: 3, isActive: true },
    { featureId: 'FEAT-0012', moduleId: 'MOD-0001', moduleCode: 'MOD-MDM', screenId: 'SCR-0005', screenCode: 'SCR-MDM-USER-ROLE-GROUPS', featureCode: 'FEAT-MDM-MANAGE-USER-GROUPS', featureName: 'Manage User Groups', displayOrder: 4, isActive: true },
    { featureId: 'FEAT-0013', moduleId: 'MOD-0001', moduleCode: 'MOD-MDM', screenId: 'SCR-0005', screenCode: 'SCR-MDM-USER-ROLE-GROUPS', featureCode: 'FEAT-MDM-MANAGE-ROLE-GROUP-ASSIGNMENTS', featureName: 'Manage Role Assignments to Groups', displayOrder: 5, isActive: true },
    { featureId: 'FEAT-0014', moduleId: 'MOD-0001', moduleCode: 'MOD-MDM', screenId: 'SCR-0006', screenCode: 'SCR-MDM-IIOT-MASTER', featureCode: 'FEAT-MDM-MANAGE-ASSETS', featureName: 'Manage Assets', displayOrder: 1, isActive: true },
    { featureId: 'FEAT-0015', moduleId: 'MOD-0001', moduleCode: 'MOD-MDM', screenId: 'SCR-0006', screenCode: 'SCR-MDM-IIOT-MASTER', featureCode: 'FEAT-MDM-MANAGE-ASSET-TAGS', featureName: 'Manage Assets Tags', displayOrder: 2, isActive: true },
    { featureId: 'FEAT-0016', moduleId: 'MOD-0001', moduleCode: 'MOD-MDM', screenId: 'SCR-0006', screenCode: 'SCR-MDM-IIOT-MASTER', featureCode: 'FEAT-MDM-MANAGE-ASSET-THRESHOLDS', featureName: 'Manage Asset Thresholds', displayOrder: 3, isActive: true },
    { featureId: 'FEAT-0017', moduleId: 'MOD-0001', moduleCode: 'MOD-MDM', screenId: 'SCR-0007', screenCode: 'SCR-MDM-AUDIT-REPORTING', featureCode: 'FEAT-MDM-AUDIT-LOGS', featureName: 'Audit Logs', displayOrder: 1, isActive: true },
    { featureId: 'FEAT-0018', moduleId: 'MOD-0001', moduleCode: 'MOD-MDM', screenId: 'SCR-0007', screenCode: 'SCR-MDM-AUDIT-REPORTING', featureCode: 'FEAT-MDM-REPORTS', featureName: 'Reports', displayOrder: 2, isActive: true },
    { featureId: 'FEAT-0019', moduleId: 'MOD-0002', moduleCode: 'MOD-IIOT', screenId: 'SCR-0008', screenCode: 'SCR-IIOT-EQUIPMENT-OVERVIEW', featureCode: 'FEAT-IIOT-EQUIPMENT-HEALTH-STATUS-PERFORMANCE-TREND', featureName: 'Equipment Health, Status & Performance Trend', displayOrder: 1, isActive: true },
    { featureId: 'FEAT-0020', moduleId: 'MOD-0002', moduleCode: 'MOD-IIOT', screenId: 'SCR-0009', screenCode: 'SCR-IIOT-MONITORING-CONSOLE', featureCode: 'FEAT-IIOT-EQUIPMENT-MONITORING', featureName: 'Equipment Monitoring', displayOrder: 1, isActive: true },
    { featureId: 'FEAT-0021', moduleId: 'MOD-0002', moduleCode: 'MOD-IIOT', screenId: 'SCR-0010', screenCode: 'SCR-IIOT-ANALYTICS-OEE', featureCode: 'FEAT-IIOT-OVERALL-EQUIPMENT-EFFICIENCY', featureName: 'Overall Equipment Efficiency', displayOrder: 1, isActive: true }
];
upsertManyWithAutoId('mdm_features', featureSeed, 'featureId', { sequenceName: 'featureId', prefix: 'FEAT', padLength: 4 });

upsertOne('mdm_role_assignments_to_user_groups', { groupId: platformAdminGroupId, roleId: superAdminRoleId }, {
    groupId: platformAdminGroupId,
    roleId: superAdminRoleId,
    isActive: true,
    assignedAt: ISODate('2026-03-01T10:10:00Z'),
    assignedBy: 'SYSTEM'
});

upsertOne('mdm_user_assignments_to_user_groups', { userId: 'SUPER_ADMIN', groupId: platformAdminGroupId }, {
    groupId: platformAdminGroupId,
    userId: 'SUPER_ADMIN',
    isActive: true,
    assignedAt: ISODate('2026-03-01T10:10:00Z'),
    assignedBy: 'SYSTEM'
});

upsertOne('mdm_role_permissions', { roleId: superAdminRoleId, moduleId: 'MOD-0001', version: 1 },
    buildRolePermissionDocument('TNT-0001', superAdminRoleId, 'MOD-0001', screenSeed, featureSeed)
);

logInfo('Minimal baseline seed applied: SUPER_ADMIN + platform admin group + auth credentials + default modules/screens/features.');

logInfo('Initializing auto-increment ID sequences...');

var sequenceDefinitions = [
    { sequenceName: 'tenantId', collectionName: 'mdm_tenants', fieldName: 'tenantId', prefix: 'TNT', padLength: 4, seedValues: [] },
    { sequenceName: 'plantId', collectionName: 'mdm_plants', fieldName: 'plantId', prefix: 'PLNT', padLength: 4, seedValues: [] },
    { sequenceName: 'departmentId', collectionName: 'mdm_departments', fieldName: 'departmentId', prefix: 'DEP', padLength: 4, seedValues: [] },
    { sequenceName: 'roomId', collectionName: 'mdm_rooms', fieldName: 'roomId', prefix: 'ROOM', padLength: 4, seedValues: [] },
    { sequenceName: 'userTrackId', collectionName: 'mdm_user_profiles', fieldName: 'userTrackId', prefix: 'USR', padLength: 4, seedValues: ['USR-0001'] },
    { sequenceName: 'groupId', collectionName: 'mdm_user_groups', fieldName: 'groupId', prefix: 'GRP', padLength: 4, seedValues: ['GRP-0001'] },
    { sequenceName: 'roleId', collectionName: 'mdm_roles', fieldName: 'roleId', prefix: 'ROLE', padLength: 4, seedValues: ['ROLE-0001'] },
    { sequenceName: 'moduleId', collectionName: 'mdm_modules', fieldName: 'moduleId', prefix: 'MOD', padLength: 4, seedValues: ['MOD-0001', 'MOD-0002', 'MOD-0003'] },
    { sequenceName: 'screenId', collectionName: 'mdm_screens', fieldName: 'screenId', prefix: 'SCR', padLength: 4, seedValues: ['SCR-0001', 'SCR-0002', 'SCR-0003', 'SCR-0004', 'SCR-0005', 'SCR-0006', 'SCR-0007', 'SCR-0008', 'SCR-0009', 'SCR-0010'] },
    { sequenceName: 'featureId', collectionName: 'mdm_features', fieldName: 'featureId', prefix: 'FEAT', padLength: 4, seedValues: ['FEAT-0001', 'FEAT-0002', 'FEAT-0003', 'FEAT-0004', 'FEAT-0005', 'FEAT-0006', 'FEAT-0007', 'FEAT-0008', 'FEAT-0009', 'FEAT-0010', 'FEAT-0011', 'FEAT-0012', 'FEAT-0013', 'FEAT-0014', 'FEAT-0015', 'FEAT-0016', 'FEAT-0017', 'FEAT-0018', 'FEAT-0019', 'FEAT-0020', 'FEAT-0021'] },
    { sequenceName: 'assignmentId', collectionName: 'mdm_user_context_assignments', fieldName: 'assignmentId', prefix: 'ASGN', padLength: 6, seedValues: [] },
    { sequenceName: 'assetId', collectionName: 'iiot_assets', fieldName: 'assetId', prefix: 'EQP-RMG', padLength: 4, seedValues: [] },
    { sequenceName: 'tagId', collectionName: 'iiot_asset_tags', fieldName: 'tagId', prefix: 'TAG', padLength: 6, seedValues: [] },
    { sequenceName: 'thresholdId', collectionName: 'iiot_tag_thresholds', fieldName: 'thresholdId', prefix: 'THR', padLength: 6, seedValues: [] },
    { sequenceName: 'documentId', collectionName: 'dms_documents', fieldName: 'documentId', prefix: 'DOC', padLength: 6, seedValues: [] }
];

for (var s = 0; s < sequenceDefinitions.length; s++) {
    initializeSequence(sequenceDefinitions[s]);
}

print('========================================');
print('Database initialization complete');
print('Collections, validators, sequences and default seed data aligned');
print('========================================');

