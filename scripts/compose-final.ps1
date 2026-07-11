# ============================================================================
#  compose-final.ps1
#  ----------------------------------------------------------------------------
#  Último paso del pipeline: toma el video de la presentación (sin audio) y
#  la pista de audio final (voz + SFX) para producir el .mp4 final.
#
#  Entradas (en /recordings):
#    presentation.webm   (1920x1080, video grabado de /ad/presentation)
#    final-audio.mp3     (voz en off + SFX mezclados)
#
#  Salidas:
#    recordings/swapture-ad.mp4     (1920x1080, 30fps)
#    recordings/swapture-ad-9x16.mp4 (1080x1920, recorte central, opcional)
#
#  Uso:
#    pwsh scripts/compose-final.ps1
#    pwsh scripts/compose-final.ps1 -Variant 9x16
# ============================================================================
[CmdletBinding()]
param(
  [ValidateSet('16x9','9x16','both')]
  [string]$Variant = 'both'
)

$ErrorActionPreference = 'Continue'

# Refrescar PATH por si FFmpeg se instaló recién
$env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')

$root = Split-Path -Parent $PSScriptRoot
$rec = Join-Path $root 'recordings'
$video = Join-Path $rec 'presentation.webm'
$audio = Join-Path $rec 'final-audio.mp3'

function Assert-File($p, $msg) {
  if (-not (Test-Path -LiteralPath $p)) {
    Write-Error "$msg`n  Falta: $p"
    exit 1
  }
}

Assert-File $video 'Falta el video de la presentación.'
Assert-File $audio 'Falta el audio final.'

$ffmpeg = (Get-Command ffmpeg -ErrorAction SilentlyContinue)
if (-not $ffmpeg) {
  Write-Error 'FFmpeg no está en PATH.'
  exit 1
}

Write-Host '🎬 Componiendo video final de Swapture...' -ForegroundColor Cyan

# Normalizar video a 30fps y mux con audio
$out16 = Join-Path $rec 'swapture-ad.mp4'
& ffmpeg -y -i $video -i $audio `
  -vf "fps=30,format=yuv420p" `
  -c:v libx264 -preset medium -crf 18 `
  -c:a aac -b:a 192k -ar 44100 `
  -movflags +faststart `
  -shortest `
  $out16 2>$null

if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $out16)) {
  Write-Error 'Falló la composición del video 16:9.'
  exit 1
}
Write-Host "`n✅ Video 16:9 generado: $out16" -ForegroundColor Green

if ($Variant -eq 'both' -or $Variant -eq '9x16') {
  $out9 = Join-Path $rec 'swapture-ad-9x16.mp4'
  # Escala "cover" desde el centro del 16:9 a 1080x1920
  & ffmpeg -y -i $out16 -i $audio `
    -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920:(in_w-1080)/2:(in_h-1920)/2,format=yuv420p,fps=30,setsar=1" `
    -c:v libx264 -preset medium -crf 18 `
    -c:a aac -b:a 192k -ar 44100 `
    -movflags +faststart `
    -shortest `
    $out9 2>$null

  if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $out9)) {
    Write-Error 'Falló la composición del video 9:16.'
    exit 1
  }
  Write-Host "✅ Video 9:16 generado: $out9" -ForegroundColor Green
}

Write-Host '\n🚀 Listo para publicar.' -ForegroundColor Green
