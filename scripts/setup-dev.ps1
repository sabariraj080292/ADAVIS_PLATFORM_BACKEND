[CmdletBinding()]
param(
    [switch]$SkipCheck,
    [switch]$BuildFirst,
    [switch]$SkipSeed,
    [switch]$NoReset,
    [switch]$ForceRestart,
    [string[]]$SkipServices = @(),
    [int]$FailureLogTailLines = 80,
    [int]$StartupTimeoutSec = 180
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Write-Host "" 
Write-Host "Bootstrapping Adavis Platform local development" -ForegroundColor Cyan

if (-not $SkipCheck) {
    & (Join-Path $PSScriptRoot "check-environment.ps1") -FailOnError
}

$runArgs = @{
    FailureLogTailLines = $FailureLogTailLines
    StartupTimeoutSec = $StartupTimeoutSec
}

if ($BuildFirst) {
    $runArgs.BuildFirst = $true
}
if ($SkipSeed) {
    $runArgs.SkipSeed = $true
}
if ($NoReset) {
    $runArgs.NoReset = $true
}
if ($ForceRestart) {
    $runArgs.ForceRestart = $true
}
if (@($SkipServices).Count -gt 0) {
    $runArgs.SkipServices = $SkipServices
}

& (Join-Path $PSScriptRoot "run-local.ps1") @runArgs