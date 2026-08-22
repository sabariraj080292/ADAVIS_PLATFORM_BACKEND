# ------------------------------------------------------------
# Resolve Python executable
# ------------------------------------------------------------

$pythonCommand = $null

# Try python first
$pythonPath = Get-Command python -ErrorAction SilentlyContinue

if ($null -ne $pythonPath) {
    $pythonCommand = $pythonPath.Source
}
else {
    # Linux / Ubuntu
    $python3Path = Get-Command python3 -ErrorAction SilentlyContinue

    if ($null -ne $python3Path) {
        $pythonCommand = $python3Path.Source
    }
}

if ($null -eq $pythonCommand) {
    throw @"
Python was not found.

Please install Python or make sure it is available in PATH.

Expected commands:

    python --version
    python3 --version
"@
}

# ------------------------------------------------------------
# Validate Python
# ------------------------------------------------------------

$pythonVersion = & $pythonCommand --version 2>&1

if ($LASTEXITCODE -ne 0) {
    throw "Python could not be executed."
}

Write-Host "Python executable : $pythonCommand" -ForegroundColor Gray
Write-Host "Python version    : $pythonVersion" -ForegroundColor Gray