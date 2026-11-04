$ErrorActionPreference = 'Stop'
$env:NEXT_TELEMETRY_DISABLED = '1'
$projectDirectory = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectDirectory
$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
$bundledRuntime = Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/node'
if ($nodeCommand) { $nodeExecutable = $nodeCommand.Source }
elseif (Test-Path -LiteralPath (Join-Path $bundledRuntime 'bin/node.exe')) { $nodeExecutable = Join-Path $bundledRuntime 'bin/node.exe' }
else { throw '找不到 Node.js。請先安裝 Node.js 22 或以上版本，然後再次雙擊啟動網站。' }
$env:PATH = (Split-Path -Parent $nodeExecutable) + ';' + $env:PATH
$listener = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($listener) { Write-Host '3000 連接埠正在使用。若網站已在運行，請開啟 http://localhost:3000 。'; exit 0 }
if (!(Test-Path -LiteralPath 'node_modules/next/dist/bin/next')) {
    Write-Host '首次啟動：正在安裝網站所需元件，請保持網絡連線。'
    $bundledPnpm = Join-Path $bundledRuntime 'node_modules/pnpm/bin/pnpm.cjs'
    if (Test-Path -LiteralPath $bundledPnpm) { & $nodeExecutable $bundledPnpm install --frozen-lockfile }
    else { npx.cmd --yes pnpm@11.25.0 install --frozen-lockfile }
    if ($LASTEXITCODE -ne 0) { throw '安裝未完成，請檢查網絡連線和上方提示。' }
}
if (!(Test-Path -LiteralPath '.next/BUILD_ID')) {
    Write-Host '正在準備網站預覽，首次可能需要幾分鐘。'
    & $nodeExecutable 'node_modules/next/dist/bin/next' build
    if ($LASTEXITCODE -ne 0) { throw '網站準備未完成，請保留上方提示以便檢查。' }
}
Write-Host ''
Write-Host '網站預覽：http://localhost:3000'
Write-Host '請保持此視窗開啟。停止網站請按 Ctrl+C，或關閉本視窗。'
Write-Host '這只會啟動本機預覽，不會部署或更改正式網站。'
& $nodeExecutable 'node_modules/next/dist/bin/next' start --hostname 127.0.0.1 --port 3000
if ($LASTEXITCODE -ne 0) { throw '網站未能啟動，請檢查上方提示。' }
