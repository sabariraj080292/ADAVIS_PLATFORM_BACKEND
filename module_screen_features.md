System user
    GRP-IT-ADMIN
        ROLE-IT-ADMIN
            


Master Data Management [e.g Module]
    1. Dashboard [exit.g.Screen]
        1.1 Overview [e.g.Feature]
    2. Tenant & License Governance 
        2.1 Manage Tenant
        2.2 Manage License
    3. Plant Topology
        3.1 Manage Plants
        3.2 Manage Buildings
        3.3 Manage Areas
        3.4 Manage Rooms
    4. Department
        4.1 Manage Departments
    5. User, Role & Groups Management
        5.1 Manage Users
        5.2 Manage Roles
        5.3 Manage Role Permissions
        5.4 Manage User Groups
        5.5 Manage Role Assignments to Groups
        5.5 Manage User Assignments to Groups
        5.6 Password Management
    6. IIOT Master Data Management
        6.1 Manage Assets
        6.2 Manage Assets Tags
        6.3 Manage Asset Thresholds
    7. Audit & Reporting
        7.1 Audit Logs
        7.2 Reports

IIOT Data Management
    1. Equipment Overview
        1.1 Equipment Health, Status & Performance Trend
    2. Monitoring Console
        2.1 Equipment Monitoring
    3. Analytics OEE
        3.1 Overall Equipment Efficiency

Sequence Mapping and Usage

Auto-increment support is seeded through two collections:
1. id_sequences: stores sequenceName and currentValue.
2. id_sequence_mappings: stores sequence to collection/field mapping metadata.

Current sequence definitions
1. tenantId -> mdm_tenants.tenantId | prefix TNT | pad 4
2. plantId -> mdm_plants.plantId | prefix PLNT | pad 4
3. departmentId -> mdm_departments.departmentId | prefix DEPT | pad 4
4. roomId -> mdm_rooms.roomId | prefix ROOM | pad 4
5. userTrackId -> mdm_user_profiles.userTrackId | prefix USR | pad 4
6. groupId -> mdm_user_groups.groupId | prefix GRP | pad 4
7. roleId -> mdm_roles.roleId | prefix ROLE | pad 4
8. moduleId -> mdm_modules.moduleId | prefix MOD | pad 4
9. screenId -> mdm_screens.screenId | prefix SCR | pad 4
10. featureId -> mdm_features.featureId | prefix FEAT | pad 4
11. assignmentId -> mdm_user_mapping_to_plants.assignmentId | prefix ASGN | pad 6
12. licenseId -> mdm_licenses.licenseId | prefix LIC | pad 4
13. assetId -> iiot_assets.assetId | prefix EQP-RMG | pad 4
14. tagId -> iiot_asset_tags.tagId | prefix TAG | pad 6
15. thresholdId -> iiot_tag_thresholds.thresholdId | prefix THR | pad 6
16. requestId -> user_lifecycle_requests.requestId | prefix REQ | pad 6
17. documentId -> dms_documents.documentId | prefix DOC | pad 6

How seed behaves
1. If an item already includes its ID, the given ID is retained.
2. If ID is missing for sequence-wired seed blocks, next ID is generated automatically.
3. Role/group dependent mappings are resolved dynamically by roleCode/groupCode after upsert.

Sequence-wired seed blocks currently enabled
1. departments
2. rooms
3. roles
4. user_groups
5. modules
6. screens
7. features

Permission Matrix Rendering Rules (UI + API)

Hierarchy
1. Module -> Screen -> Feature -> Actions
2. Supported actions: READ, WRITE, APPROVE

Visibility rules
1. A feature is visible only when actions array is non-empty.
2. A screen is visible only when it has at least one visible feature.
3. A module is visible only when it has at least one visible screen.
4. If no features are selected for a module, that module must not be listed in UI.

Admin defaults
1. SUPER_ADMIN and IT_ADMIN must have full access to all features under Master Data Management by default.
2. This default grant is applied through group permission_matrix.

License-based UI filtering
1. modules/screens/features are seeded as default master data.
2. Final UI module visibility must be filtered by tenant licensed modules.
3. Non-licensed modules must not be shown in UI even if present in master data.


Dynamic Form Creation
    Fields
    



