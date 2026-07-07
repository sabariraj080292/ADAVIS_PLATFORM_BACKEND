[CmdletBinding()]
param(
    [switch]$SkipDocker,
    [switch]$BuildFirst,
    [switch]$ForceRestart,
    [string[]]$SkipServices = @(),
    [int]$FailureLogTailLines = 80,
    [int]$StartupTimeoutSec = 180
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

. (Join-Path $PSScriptRoot "common.ps1")

Write-Section "Run Local - Adavis Platform"

Assert-Command -Name "docker"
Assert-Command -Name "mvn"

if (-not $SkipDocker -and -not (Test-DockerRunning)) {
    throw "Docker is not running. Start Docker Desktop first."
}

if ($ForceRestart) {
    Write-Step "Stopping any previously managed services"
    Stop-AllManagedServices
}

if (-not $SkipDocker) {
    Write-Step "Starting Docker infrastructure"
    Invoke-DockerCompose -Arguments @("up", "-d")
    if (-not (Wait-ForDockerInfrastructure -TimeoutSeconds $StartupTimeoutSec)) {
        throw "Docker infrastructure did not become healthy within $StartupTimeoutSec seconds."
    }
}

if ($BuildFirst) {
    & (Join-Path $PSScriptRoot "build-all.ps1") -SkipTests
}

if ([string]::IsNullOrWhiteSpace($env:JWT_SECRET) -or $env:JWT_SECRET.Length -lt 32) {
    $env:JWT_SECRET = "local-dev-jwt-secret-key-256-bits-minimum!"
    Write-Step "JWT_SECRET was missing or weak. Applied a local development fallback secret."
}

$startedServices = New-Object System.Collections.Generic.List[object]

$skipServiceSet = New-Object 'System.Collections.Generic.HashSet[string]' ([System.StringComparer]::OrdinalIgnoreCase)
foreach ($serviceName in $SkipServices) {
    if (-not [string]::IsNullOrWhiteSpace($serviceName)) {
        $null = $skipServiceSet.Add($serviceName.Trim())
    }
}

foreach ($service in Get-ServiceDefinitions) {
    if ($skipServiceSet.Contains($service.Name)) {
        Write-Step "Skipping $($service.Name) by request"
        continue
    }

    Write-Step "Starting $($service.Name)"
    $started = Start-AdavisService -Service $service
    $startedServices.Add($started)
    Save-ServiceState -Services $startedServices.ToArray()

    if (-not (Wait-ForUrl -Url $service.HealthUrl -TimeoutSeconds $StartupTimeoutSec)) {
        $failureDetails = "Service $($service.Name) failed health check: $($service.HealthUrl). See $($started.LogFile)"
        if (Test-Path $started.LogFile) {
            $tail = Get-Content -Path $started.LogFile -Tail $FailureLogTailLines -ErrorAction SilentlyContinue
            if ($null -ne $tail -and @($tail).Count -gt 0) {
                $failureDetails += "`nLast $FailureLogTailLines log lines:`n$($tail -join [Environment]::NewLine)"
            }
        }

        throw $failureDetails
    }
}

Write-Step "All services started successfully."
Write-Host ""
foreach ($service in Get-ServiceDefinitions) {
    $label = $service.Name.PadRight(11)
    if ($skipServiceSet.Contains($service.Name)) {
        Write-Host ("{0}: SKIPPED" -f $label) -ForegroundColor Yellow
    }
    else {
        Write-Host ("{0}: {1}" -f $label, $service.HealthUrl.Replace('/actuator/health', '')) -ForegroundColor Green
    }
}
Write-Host ""
Write-Host "Logs are available under scripts/logs/." -ForegroundColor Cyan