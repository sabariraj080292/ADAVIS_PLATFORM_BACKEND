[CmdletBinding()]
param()

Write-Warning "clean-run-phase1.ps1 is deprecated. Redirecting to setup-dev.ps1 with a clean reset."

& (Join-Path $PSScriptRoot "setup-dev.ps1") -ForceRestart