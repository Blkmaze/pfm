param(
  [int]$Port = 5173,
  [string]$FrontendDir = ".",
  [string]$DevCmd = "npm run dev -- --host --port"
)
$ErrorActionPreference = "Stop"

$ip = (Get-NetIPAddress -AddressFamily IPv4 `
       | Where-Object { $_.IPAddress -notlike "169.254.*" -and $_.IPAddress -ne "127.0.0.1" } `
       | Sort-Object -Property InterfaceMetric `
       | Select-Object -First 1 -ExpandProperty IPAddress)

if ($ip) {
  Write-Host ("Your LAN IP: {0}" -f $ip) -ForegroundColor Cyan
  Write-Host ("On your phone, open: http://{0}:{1}" -f $ip,$Port) -ForegroundColor Green
} else {
  Write-Host "Could not determine LAN IP. Are you connected to a network?" -ForegroundColor Yellow
}

$ruleName = "DevServer-$Port"
$rule = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
if (-not $rule) {
  New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -Action Allow -Protocol TCP -LocalPort $Port | Out-Null
  Write-Host "Firewall rule created for TCP port $Port." -ForegroundColor Green
} else {
  Write-Host "Firewall rule '$ruleName' already exists." -ForegroundColor Green
}

if (Test-Path $FrontendDir) { Push-Location $FrontendDir }
$fullCmd = "$DevCmd $Port"
Write-Host "Starting dev server: $fullCmd" -ForegroundColor Cyan
cmd /c $fullCmd
