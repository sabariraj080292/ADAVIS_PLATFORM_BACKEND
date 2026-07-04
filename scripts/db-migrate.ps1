[CmdletBinding()]
param(
    [switch]$NoReset
)

Write-Warning "No standalone migration framework is configured. Running the Mongo seed workflow instead."

& (Join-Path $PSScriptRoot "seed-data.ps1") @PSBoundParameters