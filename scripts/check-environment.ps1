[CmdletBinding()]
param(
    [switch]$FailOnError
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

. (Join-Path $PSScriptRoot "common.ps1")

$results = New-Object System.Collections.Generic.List[object]

function Add-CheckResult {
    param(
        [string]$Name,
        [ValidateSet("PASS", "WARN", "FAIL")]
        [string]$Status,
        [string]$Message
    )

    $results.Add([pscustomobject]@{
            Name    = $Name
            Status  = $Status
            Message = $Message
        })

    $color = switch ($Status) {
        "PASS" { "Green" }
        "WARN" { "Yellow" }
        default { "Red" }
    }

    Write-Host ("  [{0}] {1}" -f $Status, $Name) -ForegroundColor $color -NoNewline
    Write-Host (" - {0}" -f $Message) -ForegroundColor Gray
}

Write-Section "Adavis Platform - Environment Check"

Write-Section "Repository"

$repoRoot = Get-RepoRoot
if (Test-Path (Join-Path $repoRoot "pom.xml")) {
    Add-CheckResult -Name "Root pom.xml" -Status "PASS" -Message "Found at $repoRoot"
}
else {
    Add-CheckResult -Name "Root pom.xml" -Status "FAIL" -Message "Run scripts from inside the repository"
}

if (Test-Path $Script:DockerComposeFile) {
    Add-CheckResult -Name "Docker compose" -Status "PASS" -Message "Found docker-compose.local.yml"
}
else {
    Add-CheckResult -Name "Docker compose" -Status "FAIL" -Message "Missing docker/docker-compose.local.yml"
}

Write-Section "Machine"

try {
    $ram = (Get-CimInstance Win32_PhysicalMemory | Measure-Object -Property Capacity -Sum).Sum / 1GB
    $ramRounded = [math]::Round($ram, 0)
    if ($ram -ge 16) {
        Add-CheckResult -Name "RAM" -Status "PASS" -Message "$ramRounded GB available"
    }
    elseif ($ram -ge 8) {
        Add-CheckResult -Name "RAM" -Status "WARN" -Message "$ramRounded GB available, 16 GB recommended"
    }
    else {
        Add-CheckResult -Name "RAM" -Status "FAIL" -Message "$ramRounded GB available, 16 GB recommended"
    }
}
catch {
    Add-CheckResult -Name "RAM" -Status "WARN" -Message "Could not read installed memory"
}

try {
    $freeGB = [math]::Round((Get-PSDrive -Name C).Free / 1GB, 0)
    if ($freeGB -ge 20) {
        Add-CheckResult -Name "Disk space" -Status "PASS" -Message "$freeGB GB free on C:"
    }
    else {
        Add-CheckResult -Name "Disk space" -Status "WARN" -Message "$freeGB GB free on C:, low free space"
    }
}
catch {
    Add-CheckResult -Name "Disk space" -Status "WARN" -Message "Could not read disk usage"
}

Write-Section "Tooling"

foreach ($tool in @("docker", "java", "mvn", "git")) {
    $command = Get-Command $tool -ErrorAction SilentlyContinue
    if ($null -eq $command) {
        Add-CheckResult -Name $tool.ToUpperInvariant() -Status "FAIL" -Message "$tool is not installed or not on PATH"
        continue
    }

    switch ($tool) {
        "java" {
            $versionText = (& cmd /c "java -version 2>&1" | Out-String)
            if ($versionText -match '21') {
                Add-CheckResult -Name "JAVA" -Status "PASS" -Message "Java 21 detected"
            }
            else {
                Add-CheckResult -Name "JAVA" -Status "WARN" -Message "Java detected, but Java 21 is recommended"
            }
        }
        "docker" {
            Add-CheckResult -Name "DOCKER" -Status "PASS" -Message "Docker command available"
            if (Test-DockerRunning) {
                Add-CheckResult -Name "Docker daemon" -Status "PASS" -Message "Docker is running"
                if ((& docker compose version 2>$null) -and $LASTEXITCODE -eq 0) {
                    Add-CheckResult -Name "Docker compose" -Status "PASS" -Message "docker compose is available"
                }
                else {
                    Add-CheckResult -Name "Docker compose" -Status "FAIL" -Message "docker compose plugin is unavailable"
                }
            }
            else {
                Add-CheckResult -Name "Docker daemon" -Status "FAIL" -Message "Start Docker Desktop before running the stack"
            }
        }
        default {
            Add-CheckResult -Name $tool.ToUpperInvariant() -Status "PASS" -Message "$tool command available"
        }
    }
}

Write-Section "Ports"

foreach ($entry in @(
        @{ Name = "MongoDB"; Port = 37017 },
        @{ Name = "Redis"; Port = 8379 },
        @{ Name = "Redpanda"; Port = 10092 },
        @{ Name = "Gateway"; Port = 9080 },
        @{ Name = "Auth"; Port = 9081 },
        @{ Name = "MDM"; Port = 9083 },
        @{ Name = "License"; Port = 8082 },
        @{ Name = "Audit"; Port = 8084 }
    )) {
    if (Test-PortInUse -Port $entry.Port) {
        $managedService = Get-ServiceDefinitions | Where-Object { $_.Port -eq $entry.Port } | Select-Object -First 1
        if ($null -ne $managedService) {
            Add-CheckResult -Name ("Port {0}" -f $entry.Port) -Status "PASS" -Message ("{0} port is already in use by the managed {1} service" -f $entry.Name, $managedService.Name)
        }
        else {
            Add-CheckResult -Name ("Port {0}" -f $entry.Port) -Status "WARN" -Message ("{0} port is already in use" -f $entry.Name)
        }
    }
    else {
        Add-CheckResult -Name ("Port {0}" -f $entry.Port) -Status "PASS" -Message ("{0} port is available" -f $entry.Name)
    }
}

$failedChecks = @($results | Where-Object Status -eq "FAIL").Count
$warningChecks = @($results | Where-Object Status -eq "WARN").Count
$passedChecks = @($results | Where-Object Status -eq "PASS").Count

Write-Section "Summary"
Write-Host ("  Total Checks: {0}" -f $results.Count)
Write-Host ("  [PASS] Passed: {0}" -f $passedChecks) -ForegroundColor Green
Write-Host ("  [WARN] Warnings: {0}" -f $warningChecks) -ForegroundColor Yellow
Write-Host ("  [FAIL] Failed: {0}" -f $failedChecks) -ForegroundColor Red

if ($FailOnError -and $failedChecks -gt 0) {
    throw "Environment validation failed. Fix the reported failures and retry."
}