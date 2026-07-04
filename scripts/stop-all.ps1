[CmdletBinding()]
param(
    [switch]$KeepDocker,
    [switch]$KeepData
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

. (Join-Path $PSScriptRoot "common.ps1")

Write-Section "Stop Local - Adavis Platform"

Write-Step "Stopping managed Spring services"
Stop-AllManagedServices

if (-not $KeepDocker) {
    if (-not (Test-DockerRunning)) {
        Write-Warning "Docker is not running. Skipping container shutdown."
        return
    }

    if ($KeepData) {
        Write-Step "Stopping Docker infrastructure and preserving volumes"
        Invoke-DockerCompose -Arguments @("down")
    }
    else {
        Write-Step "Stopping Docker infrastructure and removing volumes"
        Invoke-DockerCompose -Arguments @("down", "-v")
    }
}

Write-Step "Stop workflow completed."