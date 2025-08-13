param(
  [string]$RepoName = "pfm",
  [string]$GitHubUser = "blkmaze",
  [switch]$Push
)
$ErrorActionPreference = "Stop"

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) { throw "Docker not found" }
if (-not (Get-Command git -ErrorAction SilentlyContinue))    { throw "git not found" }
if (-not (Get-Command gh -ErrorAction SilentlyContinue))     { Write-Host "(optional) GitHub CLI not foundskipping repo creation" }

Write-Host "==> Building containers"
docker compose build

Write-Host "==> Starting stack"
docker compose up -d

if (-not (Test-Path .git)) {
  git init
  git add -A
  git commit -m "Initial PFM stack"
}
$origin = "https://github.com/$GitHubUser/$RepoName.git"

if ($Push) {
  if (Get-Command gh -ErrorAction SilentlyContinue) {
    gh repo view $GitHubUser/$RepoName > $null 2>&1
    if ($LASTEXITCODE -ne 0) {
      gh repo create $GitHubUser/$RepoName --public --source . --remote origin --push
    } else {
      git remote add origin $origin -f 2>$null
      git branch -M main
      git push -u origin main
    }
  } else {
    git remote add origin $origin -f 2>$null
    git branch -M main
    git push -u origin main
  }
}

Write-Host "`nAll set. Web http://localhost:5173  | API http://localhost:4000"
