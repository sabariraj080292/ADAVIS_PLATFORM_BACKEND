[CmdletBinding()]
param(
    [switch]$NoReset
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

. (Join-Path $PSScriptRoot "common.ps1")

Write-Section "Database Seed"
Assert-Command -Name "docker"

if (-not (Test-DockerRunning)) {
    throw "Docker is not running. Start Docker Desktop first."
}

$initScript = Join-Path (Get-RepoRoot) "docker\init-mongo.js"
if (-not (Test-Path $initScript)) {
    throw "Mongo seed script not found: $initScript"
}

$containerStatus = (& docker inspect -f "{{.State.Status}}" adavis-mongodb 2>$null)
if ($LASTEXITCODE -ne 0 -or $containerStatus -ne "running") {
    throw "Container adavis-mongodb is not running. Start Docker infrastructure first."
}

# Try common auth layouts because local environments may have been initialized in different ways.
$mongoUris = @(
    "mongodb://admin:Admin123!@localhost:27017/adavis_platform?authSource=admin",
    "mongodb://admin:Admin123!@localhost:27017/adavis_platform?authSource=adavis_platform",
    "mongodb://localhost:37017/adavis_platform"
)

function Invoke-MongoCommand {
    param(
        [Parameter(Mandatory)][string[]]$Uris,
        [Parameter(Mandatory)][string[]]$Arguments,
        [switch]$Silent
    )

    $lastError = $null
    foreach ($uri in $Uris) {
        $output = & docker exec adavis-mongodb mongosh $uri --quiet @Arguments 2>&1
        if ($LASTEXITCODE -eq 0) {
            if (-not $Silent -and $null -ne $output -and "$output".Length -gt 0) {
                $output
            }
            return $true
        }

        $lastError = $output
    }

    if ($null -ne $lastError -and "$lastError".Length -gt 0) {
        Write-Error ("Mongo command failed. Last error: " + ($lastError -join [Environment]::NewLine))
    }

    return $false
}

if (-not $NoReset) {
    Write-Step "Dropping existing adavis_platform database"
    if (-not (Invoke-MongoCommand -Uris $mongoUris -Arguments @("--eval", "db.dropDatabase()"))) {
        throw "Mongo database reset failed."
    }
}

Write-Step "Applying seed script to MongoDB"
if (-not (Invoke-MongoCommand -Uris $mongoUris -Arguments @("/docker-entrypoint-initdb.d/init-mongo.js") -Silent)) {
    throw "Mongo seed operation failed."
}

Write-Step "Verifying seeded collections"
if (-not (Invoke-MongoCommand -Uris $mongoUris -Arguments @("--eval", "db.getCollectionNames().sort().forEach(function(name){ print(name); })"))) {
    throw "Mongo seed verification failed."
}

Write-Step "Database seed completed successfully."