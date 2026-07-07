Planning to build IIOT Module, Suggest the table schema to understand the impolemenation

Equipment_master (iiot_assets to iiot_equipement_master)
    equipmentSeqId
    plantId
    blockId (optional)
    areaId (optional)
    roomId (optional)
    equipmentId
    
critical_parameters  (iiot_asset_tags to equipment_critical_parameters)
    parameterSeqId
    equipmentId
    parameterId
    parameterName
    ParmaterType
        Float
        Int
        Boolean
        String

crtitical_parameters_limit (optimial) (iiot_asset_threshold to equipment_critical_parameter_limit)

    crtitical_parameters_seq_limit
    parameterId
    lowerLimit
    upperLimit (provide appropriate name)

Equipment Raw data  -->  on prem Local database (SQL database) -->  Ingest to Cloud Database

On Prem Local
    For each Equipment Separate Table --> Need to map the separate collection <equip_> suggest appropriate collection
        
For Each Equipment [EquipmentId --> EquipmentId map local database to cloud]
    Fetched the CPP data 
    Alarm & Events Data

Data Ingestion
    BatchReportIngestion
    AlarmAndEventDataIngestion

EquipmentLiveStatus 
    Based on above ingestion  - BatchReport - status -  start/stop etc (may have additional)
Batch Report (Main) -  UI
    Plant Name (Dropdown)
        Area Name (Dropdown)
            Equipment ID  - Name Selection
                Product Name (Dropdown)
                    Batch No (Mandatory)
                        Lot Number (Not Mandatory)
                            Date Range (user will select)

    Populate 3 tables
    1. CPP Data (Critical Process parameters data) 
    2. Alarms (AlarmAndEventDataIngestion)
    3. Events (AlarmAndEventDataIngestion)

IIOT Data Management (UI)
    1. Equipment Overview
        1.1 Equipment Health, Status & Performance Trend
    2. Monitoring Console
        2.1 Equipment Monitoring
    3. Analytics OEE
        3.1 Overall Equipment Efficiency


Suggest the optimal name for schema whever required






