# MediQR Clean The Slate Protocol - PowerShell Reset Utility
Write-Host "=========================================================================" -ForegroundColor Cyan
Write-Host "                MediQR Clean The Slate Automation Engine                 " -ForegroundColor Green
Write-Host "=========================================================================" -ForegroundColor Cyan

$root = Split-Path -Parent $PSScriptRoot

# 1. Stop processes on ports 3000, 5001, 5002
Write-Host "`n[1/4] Terminating lingering processes on ports 3000, 5001, 5002..." -ForegroundColor Yellow
try {
    $conns = Get-NetTCPConnection -LocalPort 3000, 5001, 5002 -State Listen -ErrorAction SilentlyContinue
    if ($conns) {
        $conns | ForEach-Object {
            $pidToStop = $_.OwningProcess
            Stop-Process -Id $pidToStop -Force -ErrorAction SilentlyContinue
            Write-Host "  [+] Stopped process $pidToStop on port $($_.LocalPort)" -ForegroundColor Gray
        }
    } else {
        Write-Host "  [+] Ports 3000, 5001, and 5002 are already free." -ForegroundColor Gray
    }
} catch {
    Write-Host "  [-] Port check notice: $($_.Exception.Message)" -ForegroundColor DarkGray
}

# 2. Reset Hospital Storage Vaults
Write-Host "`n[2/4] Resetting Hospital Storage Vaults to pristine state..." -ForegroundColor Yellow
$hospA = Join-Path $root 'hospital-nodes\storage\hospital-a'
$hospB = Join-Path $root 'hospital-nodes\storage\hospital-b'

if (Test-Path (Join-Path $hospA 'REC-APOLLO-001.backup.json')) {
    Copy-Item -Path (Join-Path $hospA 'REC-APOLLO-001.backup.json') -Destination (Join-Path $hospA 'REC-APOLLO-001.enc.json') -Force
    Write-Host "  [+] Apollo Node A (:5001) storage restored to pristine backup" -ForegroundColor Green
}

if (Test-Path (Join-Path $hospB 'REC-FORTIS-002.backup.json')) {
    Copy-Item -Path (Join-Path $hospB 'REC-FORTIS-002.backup.json') -Destination (Join-Path $hospB 'REC-FORTIS-002.enc.json') -Force
    Write-Host "  [+] Fortis Node B (:5002) storage restored to pristine backup" -ForegroundColor Green
}

# Clean any unneeded dumped records
Get-ChildItem -Path $hospA -File -ErrorAction SilentlyContinue | Where-Object { $_.Name -notlike 'REC-APOLLO-001.*' } | Remove-Item -Force -ErrorAction SilentlyContinue
Get-ChildItem -Path $hospB -File -ErrorAction SilentlyContinue | Where-Object { $_.Name -notlike 'REC-FORTIS-002.*' } | Remove-Item -Force -ErrorAction SilentlyContinue
Write-Host "  [+] All corrupted dummy dumps removed from disk." -ForegroundColor Green

# 3. Clean Next.js temporary build cache
Write-Host "`n[3/4] Purging Next.js cache..." -ForegroundColor Yellow
$nextCache = Join-Path $root 'doctor-portal\.next\cache'
if (Test-Path $nextCache) {
    Remove-Item -Path $nextCache -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  [+] Cleared Next.js build cache." -ForegroundColor Green
} else {
    Write-Host "  [+] Cache clean." -ForegroundColor Gray
}

Write-Host "`n[4/4] File system and vault reset complete!" -ForegroundColor Cyan
