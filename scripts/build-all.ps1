[CmdletBinding()]
param(
    [switch]$SkipTests = $true,
    [switch]$NoClean
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

. (Join-Path $PSScriptRoot "common.ps1")

Write-Section "Build - Adavis Platform"
Assert-Command -Name "mvn"

$arguments = @()
if (-not $NoClean) {
    $arguments += "clean"
}
$arguments += "install"
if ($SkipTests) {
    $arguments += "-DskipTests"
}

Push-Location (Get-RepoRoot)
try {
    Write-Step "Running mvn $($arguments -join ' ')"
    & mvn @arguments
    if ($LASTEXITCODE -ne 0) {
        throw "Repository build failed."
    }
}
finally {
    Pop-Location
}

Write-Step "Build completed successfully."