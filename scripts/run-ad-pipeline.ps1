# run-ad-pipeline.ps1
# ---------------------------------------------------------------------------
# Orquesta el pipeline completo del anuncio de Swapture (versión presentación):
#   1. Refresca PATH (para FFmpeg recién instalado).
#   2. Mata procesos node previos.
#   3. Levanta Next.js dev server.
#   4. Opcional: re-graba el flujo cliente/admin.
#   5. Genera narración (OpenAI TTS) y SFX.
#   6. Mezcla audio final.
#   7. Copia assets a public/ad-assets/.
#   8. Graba la página /ad/presentation.
#   9. Compone el .mp4 final (16:9 y 9:16).
#  10. Limpia.
# ---------------------------------------------------------------------------
[CmdletBinding()]
param(
  [switch]$ForceRecord,
  [switch]$SkipRecord,
  [switch]$SkipNarration,
  [string]$Url = 'http://localhost:3000'
)

$ErrorActionPreference = 'Stop'

# Refrescar PATH para detectar FFmpeg
$env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')

function Wait-ForServer {
  param([string]$BaseUrl = 'http://localhost:3000', [int]$TimeoutSeconds = 120)
  $uri = [Uri]$BaseUrl
  for ($i = 0; $i -lt $TimeoutSeconds; $i++) {
    try {
      $tcp = New-Object System.Net.Sockets.TcpClient
      $tcp.Connect($uri.Host, $uri.Port)
      $tcp.Close()
      return $true
    } catch { }
    Start-Sleep -Seconds 1
    if ($i % 5 -eq 0) { Write-Host "  ... esperando servidor ($i s)" -ForegroundColor DarkGray }
  }
  return $false
}

function Stop-NodeProcesses {
  Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
}

function Assert-Step {
  param([int]$Code, [string]$Name)
  if ($Code -ne 0) { throw "$Name falló con código $Code" }
}

# 1. Limpieza
Write-Host 'Deteniendo procesos node previos...' -ForegroundColor Cyan
Stop-NodeProcesses
Start-Sleep -Seconds 2

# 2. Iniciar dev server
Write-Host 'Iniciando Next.js dev server...' -ForegroundColor Cyan
$devProc = Start-Process -FilePath 'cmd.exe' `
  -ArgumentList '/c','npm run dev > dev-out.log 2> dev-err.log' `
  -PassThru -WindowStyle Hidden

# 3. Esperar
Write-Host 'Esperando a que el servidor esté listo...' -ForegroundColor Cyan
if (-not (Wait-ForServer -BaseUrl $Url)) {
  Write-Error "El servidor no respondió. Revisa dev-out.log y dev-err.log"
  Stop-Process -Id $devProc.Id -Force -ErrorAction SilentlyContinue
  exit 1
}
Write-Host "Servidor listo en $Url" -ForegroundColor Green

try {
  # 4. Grabar flujo cliente/admin (opcional)
  $hasRecordings = (Test-Path 'recordings/01-customer.webm') -and (Test-Path 'recordings/02-admin.webm')
  if (-not $SkipRecord -and ($ForceRecord -or -not $hasRecordings)) {
    Write-Host "`nGrabando flujo de app (record-swapture-ad.js)..." -ForegroundColor Cyan
    node scripts/record-swapture-ad.js $Url
    Assert-Step $LASTEXITCODE 'record-swapture-ad.js'
  } else {
    Write-Host "`nSaltando grabación de app (usando recordings existentes)." -ForegroundColor DarkGray
  }

  # Normalizar recordings (eliminar bordes grises si los hubiera)
  Write-Host "`nNormalizando recordings..." -ForegroundColor Cyan
  node scripts/normalize-recordings.js
  Assert-Step $LASTEXITCODE 'normalize-recordings.js'

  # 5. Narración
  if (-not $SkipNarration) {
    Write-Host "`nGenerando narración (OpenAI TTS)..." -ForegroundColor Cyan
    node scripts/generate-narration.js
    Assert-Step $LASTEXITCODE 'generate-narration.js'
  } else {
    Write-Host "`nSaltando generación de narración." -ForegroundColor DarkGray
  }

  # 6. SFX
  Write-Host "`nGenerando efectos de sonido..." -ForegroundColor Cyan
  node scripts/generate-sfx.js
  Assert-Step $LASTEXITCODE 'generate-sfx.js'

  # 7. Mezclar audio
  Write-Host "`nMezclando audio final..." -ForegroundColor Cyan
  node scripts/mix-audio.js
  Assert-Step $LASTEXITCODE 'mix-audio.js'

  # 8. Preparar assets para la web
  Write-Host "`nCopiando assets a public/ad-assets/..." -ForegroundColor Cyan
  node scripts/prepare-ad-assets.js
  Assert-Step $LASTEXITCODE 'prepare-ad-assets.js'

  # 9. Grabar presentación
  Write-Host "`nGrabando página de presentación..." -ForegroundColor Cyan
  node scripts/record-presentation.js $Url
  Assert-Step $LASTEXITCODE 'record-presentation.js'

  # 10. Componer final
  Write-Host "`nComponiendo .mp4 final..." -ForegroundColor Cyan
  & powershell -ExecutionPolicy Bypass -File scripts/compose-final.ps1 -Variant both
  Assert-Step $LASTEXITCODE 'compose-final.ps1'

  # 11. Reportar
  Write-Host "`n✅ Pipeline completado." -ForegroundColor Green
  $files = @(
    'recordings/01-customer.webm',
    'recordings/02-admin.webm',
    'recordings/narration.mp3',
    'recordings/final-audio.mp3',
    'recordings/presentation.webm',
    'recordings/swapture-ad.mp4',
    'recordings/swapture-ad-9x16.mp4'
  )
  foreach ($f in $files) {
    if (Test-Path -LiteralPath $f) {
      $sz = (Get-Item $f).Length
      Write-Host "   $f  ->  $([math]::Round($sz/1MB,2)) MB" -ForegroundColor Green
    } else {
      Write-Host "   $f  ->  NO ENCONTRADO" -ForegroundColor Red
    }
  }
} finally {
  # 12. Limpieza
  Write-Host "`nDeteniendo dev server..." -ForegroundColor Cyan
  Stop-Process -Id $devProc.Id -Force -ErrorAction SilentlyContinue
  Stop-NodeProcesses
}
