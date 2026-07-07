

SUPER_ADMIN
    
IT_ADMIN

Access
    GROUP
        ROLE
            Permission
    
External ROle



"isExternal": null,


GRP-SUPER-ADMIN

GRP-IT-ADMIN
    Master MDM 
GRP-IIOT 
    Operatoer
    reviewer
    approver


Operator Head
Plant Head
    Production Manager
Quality Head


Tenant
    1
    2
        Plant 1 & 2
    3
    4
        Plant 3 & 4


User Obarding
    Add User - 
    Evidence Request
    Set password


Role
Group

1 action
2. 

Connnection

    
Raw

Equipment -> C

Equipment_master
    equipmentSeqId
    plantId (Optional)
    blockId (optional)
    areaId (optional)
    roomId (optional)
    equipmentId

critical_parameters
    parameterSeqId
    equipmentId
    parameterId
    parameterName
    ParmaterType
        Float
        Int
        Boolean
        String

crtitical_parameters_limit (optimial)
    crtitical_parameters_seq_limit
    parameterId



Equipment Raw data  -->  on prem Local database (SQL database) -->  Ingest to Cloud Database

On Prem Local
    For each Equipment Separate Table --> Need to map the separate collection <equipment_>
        

For Each Equipment [EquipmentId --> EquipmentId map local database to cloud]
    Fetched the CPP data 
    Alarm & Events Data

Data Ingestion
    BatchReportIngestion
    AlarmAndEventDataIngestion


EquipmentLiveStatus 
    Based on above ingestion  - batchreport - status -  start/stop etc (may have additional)
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
2. Alarms
3. Events









