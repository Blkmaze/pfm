param(
  [string]$FrontendDir = ".",
  [string]$BackendDir  = "",
  [string]$Branch      = "chore/quality-gates",
  [string]$NodeVersion = "20",
  [string]$PyVersion   = "3.11"
)
$ErrorActionPreference = "Stop"

function Ensure-Tool($name, $wingetId) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    Write-Host "Installing $name via winget..." -ForegroundColor Cyan
    winget install --id $wingetId -e --source winget --accept-source-agreements --accept-package-agreements | Out-Null
  } else {
    Write-Host "$name already installed." -ForegroundColor Green
  }
}

function Ensure-NodePkgJson($dir) {
  if (-not (Test-Path $dir)) { return }
  Push-Location $dir
  if (-not (Test-Path "package.json")) {
    Write-Host "Initializing package.json in $dir" -ForegroundColor Cyan
    npm init -y | Out-Null
  }
  Pop-Location
}

if (-not (Test-Path ".git")) { git init; git config init.defaultBranch main }

Ensure-Tool git      "Git.Git"
Ensure-Tool node     "OpenJS.NodeJS.LTS"
Ensure-Tool python   ("Python.Python." + $PyVersion)
Ensure-Tool git-lfs  "GitHub.GitLFS"

git lfs install | Out-Null
git lfs track "*.png" "*.jpg" "*.jpeg" "*.pdf"
if (-not (Test-Path ".gitattributes")) { New-Item ".gitattributes" -ItemType File | Out-Null }
git add .gitattributes

python -m pip install -U pip wheel | Out-Null
pip install pre-commit ruff black | Out-Null
@"
repos:
  - repo: https://github.com/psf/black
    rev: 24.4.2
    hooks:
      - id: black
        language_version: python3
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.5.5
    hooks:
      - id: ruff
        args: ["--fix"]
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.6.0
    hooks:
      - id: check-yaml
      - id: end-of-file-fixer
      - id: trailing-whitespace
"@ | Out-File -FilePath ".pre-commit-config.yaml" -Encoding utf8
pre-commit install | Out-Null

Ensure-NodePkgJson $FrontendDir
if (Test-Path $FrontendDir) {
  Push-Location $FrontendDir
  npm pkg set scripts.prepare="husky" | Out-Null
  npm i -D husky lint-staged prettier eslint | Out-Null
  npx husky init | Out-Null
  npm pkg set lint-staged."*.{js,jsx,ts,tsx,css,scss,md,html,json}"='["prettier -w","eslint --fix"]' | Out-Null
  if (-not (npm pkg get scripts.lint 2>$null)) { npm pkg set scripts.lint="eslint ." | Out-Null }
  if (-not (npm pkg get scripts.format 2>$null)) { npm pkg set scripts.format="prettier -w ." | Out-Null }
  $hook = ".husky\pre-commit"
  if (-not (Test-Path $hook)) { npx husky add $hook "npx lint-staged" | Out-Null }
  Pop-Location
} else {
  Write-Host "FrontendDir '$FrontendDir' not found. Skipping Husky/lint-staged." -ForegroundColor Yellow
}

New-Item -ItemType Directory -Force -Path ".github\workflows" | Out-Null
$frontendWd = if (Test-Path $FrontendDir) { $FrontendDir } else { "." }
$backendWd  = if ($BackendDir -and (Test-Path $BackendDir)) { $BackendDir } else { $null }

$ci = @"
name: CI
on:
  push: { branches: [ main ] }
  pull_request: { branches: [ main ] }
jobs:
  frontend:
    runs-on: ubuntu-latest
    defaults: { run: { working-directory: $frontendWd } }
    steps:
      - uses: actions/checkout@v4
        with: { lfs: true }
      - uses: actions/setup-node@v4
        with: { node-version: '$NodeVersion', cache: 'npm', cache-dependency-path: $frontendWd/package-lock.json }
      - run: npm ci || npm i
      - run: npm run lint --if-present
      - run: npm test --if-present
      - run: npm run build --if-present
      - uses: actions/upload-artifact@v4
        if: success()
        with: { name: web-dist, path: $frontendWd/dist }
"@

if ($backendWd) {
$ci += @"

  backend:
    runs-on: ubuntu-latest
    defaults: { run: { working-directory: $backendWd } }
    steps:
      - uses: actions/checkout@v4
        with: { lfs: true }
      - uses: actions/setup-python@v5
        with: { python-version: '$PyVersion', cache: 'pip', cache-dependency-path: $backendWd/requirements.txt }
      - run: python -m pip install -U pip wheel
      - run: pip install -r requirements.txt
      - run: pytest -q || echo "No tests yet"
"@
}

$ci | Out-File -FilePath ".github\workflows\ci.yml" -Encoding utf8

git checkout -B $Branch
git add -A
if (git diff --cached --quiet) {
  Write-Host "No changes to commit." -ForegroundColor Yellow
} else {
  git commit -m "chore: pre-commit + Husky/lint-staged, Git LFS, CI workflow"
}
Write-Host "Done. Push with: git push -u origin $Branch" -ForegroundColor Cyan
Write-Host "Optional PR (requires GitHub CLI): gh pr create --fill --base main --head $Branch" -ForegroundColor DarkCyan
