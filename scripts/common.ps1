Set-StrictMode -Version Latest

$Script:RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$Script:DockerComposeFile = Join-Path $Script:RepoRoot "docker\docker-compose.local.yml"
$Script:StateDir = Join-Path $PSScriptRoot ".state"
$Script:LogDir = Join-Path $PSScriptRoot "logs"
$Script:ServiceStateFile = Join-Path $Script:StateDir "services.json"

$Script:ServiceDefinitions = @(
    @{ Name = "auth-service"; Path = "services/auth-service"; Port = 9081; HealthUrl = "http://localhost:9081/actuator/health" },
    @{ Name = "mdm-service"; Path = "services/mdm-service"; Port = 9083; HealthUrl = "http://localhost:9083/actuator/health" },
    @{ Name = "iiot-service"; Path = "services/iiot-service"; Port = 9085; HealthUrl = "http://localhost:9085/actuator/health" },
    @{ Name = "license-service"; Path = "services/license-service"; Port = 8082; HealthUrl = "http://localhost:8082/actuator/health" },
    @{ Name = "audit-service"; Path = "services/audit-service"; Port = 8084; HealthUrl = "http://localhost:8084/actuator/health" },
    @{ Name = "api-gateway"; Path = "services/api-gateway"; Port = 9080; HealthUrl = "http://localhost:9080/actuator/health" }
)

function Get-RepoRoot {
    return $Script:RepoRoot
}

function Initialize-ScriptDirectories {
    foreach ($path in @($Script:StateDir, $Script:LogDir)) {
        if (-not (Test-Path $path)) {
            $null = New-Item -ItemType Directory -Path $path -Force
        }
    }
}

function Write-Section {
    param([string]$Title)

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host $Title -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
}

function Write-Step {
    param([string]$Message)

    Write-Host ("[INFO] {0}" -f $Message) -ForegroundColor Cyan
}

function Assert-Command {
    param([Parameter(Mandatory)][string]$Name)

    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Required command '$Name' is not available on PATH."
    }
}

function Test-DockerRunning {
    try {
        & docker ps | Out-Null
        return ($LASTEXITCODE -eq 0)
    }
    catch {
        return $false
    }
}

function Invoke-DockerCompose {
    param([Parameter(Mandatory)][string[]]$Arguments)

    & docker compose -f $Script:DockerComposeFile @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "docker compose $($Arguments -join ' ') failed."
    }
}

function Get-ServiceDefinitions {
    return $Script:ServiceDefinitions
}

function Get-ServiceState {
    if (-not (Test-Path $Script:ServiceStateFile)) {
        return @()
    }

    $content = Get-Content $Script:ServiceStateFile -Raw
    if ([string]::IsNullOrWhiteSpace($content)) {
        return @()
    }

    $parsed = ConvertFrom-Json $content
    if ($parsed -is [System.Array]) {
        return $parsed
    }

    return @($parsed)
}

function Save-ServiceState {
    param([Parameter(Mandatory)][object[]]$Services)

    Initialize-ScriptDirectories
    $Services | ConvertTo-Json -Depth 5 | Set-Content -Path $Script:ServiceStateFile
}

function Test-PortInUse {
    param([Parameter(Mandatory)][int]$Port)

    try {
        return [bool](Get-NetTCPConnection -LocalPort $Port -ErrorAction Stop)
    }
    catch {
        return $false
    }
}

function Wait-ForPortFree {
    param(
        [Parameter(Mandatory)][int]$Port,
        [int]$TimeoutSeconds = 30,
        [int]$RetryIntervalSeconds = 1
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    do {
        if (-not (Test-PortInUse -Port $Port)) {
            return $true
        }

        Start-Sleep -Seconds $RetryIntervalSeconds
    } while ((Get-Date) -lt $deadline)

    return $false
}

function Wait-ForUrl {
    param(
        [Parameter(Mandatory)][string]$Url,
        [int]$TimeoutSeconds = 180,
        [int]$RetryIntervalSeconds = 3
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    do {
        try {
            $response = Invoke-RestMethod -Uri $Url -Method Get -TimeoutSec 10
            if ($null -ne $response.status -and $response.status -eq "UP") {
                return $true
            }
        }
        catch {
        }

        Start-Sleep -Seconds $RetryIntervalSeconds
    } while ((Get-Date) -lt $deadline)

    return $false
}

function Wait-ForDockerInfrastructure {
    param([int]$TimeoutSeconds = 180)

    $containers = @("adavis-mongodb", "adavis-redis", "adavis-redpanda")
    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)

    do {
        $healthyCount = 0
        foreach ($container in $containers) {
            try {
                $status = (& docker inspect -f "{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}" $container 2>$null)
                if ($status -match "healthy|running") {
                    $healthyCount++
                }
            }
            catch {
            }
        }

        if ($healthyCount -eq $containers.Count) {
            return $true
        }

        Start-Sleep -Seconds 5
    } while ((Get-Date) -lt $deadline)

    return $false
}

function Start-AdavisService {
    param(
        [Parameter(Mandatory)][hashtable]$Service,
        [string]$MavenArguments = "spring-boot:run -DskipTests"
    )

    Initialize-ScriptDirectories

    $servicePath = Join-Path $Script:RepoRoot $Service.Path
    if (-not (Test-Path $servicePath)) {
        throw "Service path not found: $servicePath"
    }

    try {
        $connections = @(Get-NetTCPConnection -State Listen -LocalPort $Service.Port -ErrorAction SilentlyContinue)
        foreach ($connection in $connections) {
            $owningProcessId = [int]$connection.OwningProcess
            if ($owningProcessId -le 0) {
                continue
            }

            Write-Step "Stopping existing process on port $($Service.Port) for $($Service.Name) (PID $owningProcessId)"
            Stop-AdavisService -ProcessId $owningProcessId
        }
    }
    catch {
        Write-Warning "Failed to clear port $($Service.Port) for $($Service.Name): $($_.Exception.Message)"
    }

    if (-not (Wait-ForPortFree -Port $Service.Port -TimeoutSeconds 30)) {
        throw "Port $($Service.Port) is still in use after stopping prior $($Service.Name) process."
    }

    $logFile = Join-Path $Script:LogDir ("{0}.log" -f $Service.Name)
    $launcher = "Set-Location '$servicePath'; mvn $MavenArguments *> '$logFile'"

    $process = Start-Process -FilePath "powershell.exe" `
        -ArgumentList @("-NoLogo", "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", $launcher) `
        -WindowStyle Minimized `
        -PassThru

    return [pscustomobject]@{
        Name      = $Service.Name
        Pid       = $process.Id
        Path      = $Service.Path
        HealthUrl = $Service.HealthUrl
        LogFile   = $logFile
        StartedAt = (Get-Date).ToString("o")
    }
}

function Stop-AdavisService {
    param([Parameter(Mandatory)][int]$ProcessId)

    $null = Start-Process -FilePath "taskkill.exe" -ArgumentList @("/PID", $ProcessId, "/T", "/F") -NoNewWindow -PassThru -Wait
}

function Stop-AllManagedServices {
    $state = Get-ServiceState
    $stoppedProcessIds = New-Object System.Collections.Generic.HashSet[int]

    foreach ($service in $state) {
        try {
            if (Get-Process -Id $service.Pid -ErrorAction SilentlyContinue) {
                Write-Step "Stopping $($service.Name) (PID $($service.Pid))"
                Stop-AdavisService -ProcessId ([int]$service.Pid)
                $null = $stoppedProcessIds.Add([int]$service.Pid)
            }
        }
        catch {
            Write-Warning "Failed to stop $($service.Name): $($_.Exception.Message)"
        }
    }

    foreach ($service in Get-ServiceDefinitions) {
        try {
            $connections = @(Get-NetTCPConnection -State Listen -LocalPort $service.Port -ErrorAction SilentlyContinue)
            foreach ($connection in $connections) {
                $owningProcessId = [int]$connection.OwningProcess
                if ($owningProcessId -le 0 -or $stoppedProcessIds.Contains($owningProcessId)) {
                    continue
                }

                Write-Step "Stopping process on port $($service.Port) for $($service.Name) (PID $owningProcessId)"
                Stop-AdavisService -ProcessId $owningProcessId
                $null = $stoppedProcessIds.Add($owningProcessId)
            }
        }
        catch {
            Write-Warning "Failed to inspect port $($service.Port): $($_.Exception.Message)"
        }
    }

    if (Test-Path $Script:ServiceStateFile) {
        Remove-Item $Script:ServiceStateFile -Force
    }
}