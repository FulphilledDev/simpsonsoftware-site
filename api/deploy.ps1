# Deploy the API to Azure App Service.
#
# Authentication is Microsoft Entra via the Azure CLI — there is no password in this file,
# in your environment, or in the repo. Run `az login` once per machine; the session is cached.
# This works with SCM basic auth turned OFF, which is the point.
#
# The subscription is pinned below rather than inherited. A scheduled run picks up whatever
# `az account set` last left as the default, so inheriting it is a silent-failure risk.
# Pinned by ID, not name: subscription names are renameable AND cached locally by the CLI,
# so a name can resolve differently on two machines or after `az account list --refresh`.
#   380e7b3c-110b-4469-8736-c1f540a313ef  SimpsonSoftware  (was FireNIceCream)
#   f361201f-f3ae-4ccb-91e3-42d04d16f522  FireAndIce       (pre-migration home)
#
#   .\deploy.ps1              deploy to the default app below
#   .\deploy.ps1 -WhatIf      build the zip, skip the upload

[CmdletBinding(SupportsShouldProcess)]
param(
    [string]$AppName       = 'simpson-software-api',
    [string]$ResourceGroup = 'simpson-software-rg',
    [string]$Subscription  = '380e7b3c-110b-4469-8736-c1f540a313ef'   # SimpsonSoftware
)

$root       = $PSScriptRoot
$publishDir = Join-Path $root 'publish'
$zipPath    = Join-Path $root 'deploy.zip'

# ── Preflight ────────────────────────────────────────────────────────────────
if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
    Write-Error 'Azure CLI not found. Install it: https://aka.ms/installazurecli'
    exit 1
}

$azVersion = az version --query '"azure-cli"' -o tsv 2>$null
if ($LASTEXITCODE -eq 0 -and $azVersion) {
    if ([version]($azVersion -replace '[^0-9.].*$') -lt [version]'2.48.1') {
        Write-Error "Azure CLI $azVersion is too old. Entra-authenticated deploys need 2.48.1+. Run: az upgrade"
        exit 1
    }
} else {
    Write-Warning 'Could not read the Azure CLI version; continuing.'
}

az account show --only-show-errors 1>$null 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Error 'Not signed in to Azure. Run: az login'
    exit 1
}

# Ask Azure for the real hostname. App Service issues a unique default hostname with a
# random suffix, so "<app>.azurewebsites.net" is not a safe thing to construct.
# ($appHost, not $host — $Host is a PowerShell automatic variable and cannot be assigned.)
$appHost = az webapp show --subscription $Subscription -g $ResourceGroup -n $AppName --query defaultHostName -o tsv 2>$null
if ($LASTEXITCODE -ne 0 -or -not $appHost) {
    Write-Error "Cannot see '$AppName' in resource group '$ResourceGroup' under subscription '$Subscription'. List what is there with:  az webapp list --subscription '$Subscription' -o table"
    exit 1
}
Write-Host "Target: $AppName / $ResourceGroup / $Subscription"
Write-Host "URL:    https://$appHost"

if (-not (Test-Path $publishDir)) {
    Write-Error "No publish output at $publishDir. Run: dotnet publish src\PhitDevPortfolio.API\PhitDevPortfolio.API.csproj -c Release -o api\publish"
    exit 1
}

# ── Build a Linux-compatible zip (exclude runtimes\win and local wwwroot uploads) ──
Write-Host 'Building deploy.zip ...'
$moved = @{}
try {
    foreach ($name in @('runtimes', 'wwwroot')) {
        $src = Join-Path $publishDir $name
        if (Test-Path $src) {
            $bak = Join-Path $root "${name}_bak"
            Move-Item $src $bak
            $moved[$src] = $bak
        }
    }

    $devCfg = Join-Path $publishDir 'appsettings.Development.json'
    if (Test-Path $devCfg) { Remove-Item $devCfg }

    Remove-Item $zipPath -Force -ErrorAction SilentlyContinue
    Compress-Archive -Path "$publishDir/*" -DestinationPath $zipPath -Force
}
finally {
    # restore even if the build above threw, so publish/ is never left gutted
    foreach ($pair in $moved.GetEnumerator()) {
        if (Test-Path $pair.Value) { Move-Item $pair.Value $pair.Key }
    }
}

$sizeMb = [math]::Round((Get-Item $zipPath).Length / 1MB, 1)
Write-Host "Built $zipPath ($sizeMb MB)"

# ── Upload ───────────────────────────────────────────────────────────────────
if (-not $PSCmdlet.ShouldProcess("$AppName ($ResourceGroup)", 'deploy zip')) {
    Write-Host 'WhatIf: zip built, upload skipped.'
    return
}

Write-Host "Deploying to $AppName ..."
az webapp deploy `
    --subscription $Subscription `
    --resource-group $ResourceGroup `
    --name $AppName `
    --src-path $zipPath `
    --type zip `
    --clean true `
    --restart true `
    --track-status false

if ($LASTEXITCODE -ne 0) {
    Write-Error "Deploy failed (az exit $LASTEXITCODE)."
    exit $LASTEXITCODE
}

Write-Host "Deployed. https://$appHost" -ForegroundColor Green
