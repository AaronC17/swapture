# ============================================================================
#  compose-ad.ps1
#  ----------------------------------------------------------------------------
#  Post-producción del anuncio de Swapture.
#  Toma los dos .webm generados por record-swapture-ad.js y produce un .mp4
#  final con:
#    1) Overlay del marco iPhone 17 sobre el segmento del cliente (vertical).
#    2) Crossfade suave entre el segmento "phone" y el segmento "admin".
#    3) Export H.264 30fps sin caídas de frames.
#
#  ENTRADAS (en /recordings):
#    01-customer.webm   (393x852, vertical, retina)
#    02-admin.webm      (1440x900, horizontal)
#    iphone17-frame.png (marco iPhone con área de pantalla TRANSPARENTE)
#
#  SALIDA:
#    recordings/swapture-ad.mp4   (1920x1080, feed horizontal)
#    recordings/swapture-ad-9x16.mp4  (1080x1920, Reels/TikTok, opcional)
#
#  REQUISITOS:
#    - FFmpeg instalado y en PATH (https://ffmpeg.org/download.html)
#    - Un PNG del marco iPhone 17 con el hueco de la pantalla transparente.
#      Colócalo en recordings/iphone17-frame.png.
#      El hueco transparente debe coincidir con la proporción 393:852 (~9:19.5).
#      Si tu PNG tiene otra proporción, ajusta $ScreenW / $ScreenH / offsets.
#
#  USO:
#    pwsh scripts/compose-ad.ps1
#    pwsh scripts/compose-ad.ps1 -Variant 9x16      # versión Reels/TikTok
# ============================================================================
[CmdletBinding()]
param(
  [ValidateSet('16x9','9x16')]
  [string]$Variant = '16x9'
)

$ErrorActionPreference = 'Continue'  # ffmpeg escribe progreso a stderr; no detener por eso
$ci = [System.Globalization.CultureInfo]::InvariantCulture

$root   = Split-Path -Parent $PSScriptRoot
$rec    = Join-Path $root 'recordings'
$phone  = Join-Path $rec '01-customer.webm'
$admin  = Join-Path $rec '02-admin.webm'
$frame  = Join-Path $rec 'iphone17-frame.png'

# ── Dimensiones del marco iPhone 17 (ajusta a tu PNG) ──────────────────────
# El área transparente (pantalla) dentro del PNG. Por defecto marco 1170x2532.
$FrameW   = 1170
$FrameH   = 2532
$ScreenW  = 1080      # ancho del hueco transparente (pantalla)
$ScreenH  = 2340      # alto del hueco transparente
$ScreenX  = 45        # offset X del hueco dentro del PNG
$ScreenY  = 96        # offset Y del hueco dentro del PNG

function Assert-File($p, $msg) {
  if (-not (Test-Path -LiteralPath $p)) {
    Write-Error "$msg`n  Falta: $p"
    exit 1
  }
}

Assert-File $phone 'Falta el video del cliente.'
Assert-File $admin 'Falta el video del admin.'
Assert-File $frame 'Falta el PNG del marco iPhone 17.'

# Verificar ffmpeg
$ffmpeg = (Get-Command ffmpeg -ErrorAction SilentlyContinue)
if (-not $ffmpeg) {
  Write-Error 'FFmpeg no está instalado o no está en PATH. Instálalo desde https://ffmpeg.org/download.html'
  exit 1
}

Write-Host '🎬  Componiendo anuncio de Swapture...' -ForegroundColor Cyan

# ── 1) Overlay iPhone 17 sobre el segmento del cliente ─────────────────────
#  Escalamos el marco a su tamaño nativo, escalamos el video del cliente al
#  tamaño del hueco y lo posicionamos en (ScreenX, ScreenY).
$phoneFramed = Join-Path $rec '01-customer-framed.mp4'

# filter_complex:
#  [0:v] escala el marco PNG a FrameW x FrameH
#  [1:v] escala el video phone al hueco (ScreenW x ScreenH)
#  overlay: pone el video DENTRO del hueco (el PNG tiene transparencia ahí),
#           pero queremos el marco ENCIMA del video, por eso el orden es:
#           [video] como base, [marco] como overlay -> el marco tapa los bordes.
$overlayFilter = `
  "[0:v]scale=$FrameW`:$FrameH[fm];" +
  "[1:v]scale=$ScreenW`:$ScreenH[screen];" +
  "[fm][screen]overlay=$ScreenX`:$ScreenY`:" +
  "format=auto,setsar=1"

Write-Host '   [1/3] Overlay iPhone 17 sobre 01-customer.webm...'
& ffmpeg -y -i $frame -i $phone -filter_complex $overlayFilter `
  -r 30 -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p $phoneFramed 2>$null
if ($LASTEXITCODE -ne 0) { Write-Error 'Falló el overlay del iPhone.'; exit 1 }
if (-not (Test-Path -LiteralPath $phoneFramed)) { Write-Error 'Falló el overlay del iPhone.'; exit 1 }

# ── 2) Normalizar el admin a 1920x1080 (con padding) ───────────────────────
#  El admin es 1440x900. Lo escalamos a 1920x1200 y centramos con pad a 1080
#  de alto (bars negras finas) para mantener proporción limpia.
$adminNorm = Join-Path $rec '02-admin-norm.mp4'
Write-Host '   [2/3] Normalizando 02-admin.webm a 1920x1080...'
& ffmpeg -y -i $admin -vf `
  "scale=1920:1200,crop=1920:1080,setsar=1,fps=30" `
  -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p $adminNorm 2>$null
if ($LASTEXITCODE -ne 0) { Write-Error 'Falló la normalización del admin.'; exit 1 }
if (-not (Test-Path -LiteralPath $adminNorm)) { Write-Error 'Falló la normalización del admin.'; exit 1 }

# ── 3) Concatenar con crossfade ────────────────────────────────────────────
#  xfade con transition=fadeblack y duration 0.6s.
#  Necesitamos la duración del primer clip para el offset del xfade.
$durOut = & ffmpeg -i $phoneFramed 2>&1 | Select-String 'Duration:'
$durLine = ($durOut | Select-Object -First 1).ToString()
if ($durLine -match 'Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)') {
  $phoneDur = [double]::Parse($Matches[3], $ci)
} else { $phoneDur = 20 }

$fadeDur = 0.6
$offset = ([math]::Max(0, $phoneDur - $fadeDur)).ToString($ci)
$fadeDurStr = $fadeDur.ToString($ci)

if ($Variant -eq '16x9') {
  # ── Versión Feed 16:9 (1920x1080) ──
  #  El segmento phone-framed (vertical) se embebe centrado sobre fondo 1920x1080.
  $phonePad = Join-Path $rec '01-customer-pad.mp4'
  $pw = 412   # ancho del phone dentro del frame 16:9 (centrado, deja margen)
  $ph = [int]($pw * ($FrameH / $FrameW))
  $px = [int]((1920 - $pw) / 2)
  $py = [int]((1080 - $ph) / 2)
  Write-Host '   [3/3] Embebiendo phone en 16:9 + crossfade a admin...'
  & ffmpeg -y -i $phoneFramed -vf `
    "scale=$pw`:$ph,pad=1920:1080:$px`:$py:black,setsar=1,fps=30" `
    -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p $phonePad 2>$null
  if ($LASTEXITCODE -ne 0) { Write-Error 'Falló el padding del phone.'; exit 1 }

  $out = Join-Path $rec 'swapture-ad.mp4'
  & ffmpeg -y -i $phonePad -i $adminNorm `
    -filter_complex "[0:v][1:v]xfade=transition=fadeblack:duration=$fadeDurStr`:offset=$offset`,format=yuv420p" `
    -r 30 -c:v libx264 -preset medium -crf 18 -movflags +faststart $out 2>$null
  if ($LASTEXITCODE -ne 0) { Write-Error 'Falló el crossfade final.'; exit 1 }
  Write-Host "`n✅  Anuncio 16:9 generado: $out" -ForegroundColor Green
}
else {
  # ── Versión Reels/TikTok 9:16 (1080x1920) ──
  #  El segmento phone-framed casi llena el 9:16; el admin se escala y centra.
  $phonePad9 = Join-Path $rec '01-customer-9x16.mp4'
  $pw9 = 1080
  $ph9 = [int]($pw9 * ($FrameH / $FrameW))
  if ($ph9 -gt 1920) { $ph9 = 1920; $pw9 = [int]($ph9 * ($FrameW / $FrameH)) }
  $px9 = [int]((1080 - $pw9) / 2)
  $py9 = [int]((1920 - $ph9) / 2)
  & ffmpeg -y -i $phoneFramed -vf `
    "scale=$pw9`:$ph9,pad=1080:1920:$px9`:$py9:black,setsar=1,fps=30" `
    -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p $phonePad9 2>$null
  if ($LASTEXITCODE -ne 0) { Write-Error 'Falló el padding 9:16 del phone.'; exit 1 }

  $admin9 = Join-Path $rec '02-admin-9x16.mp4'
  & ffmpeg -y -i $adminNorm -vf `
    "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black,setsar=1,fps=30" `
    -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p $admin9 2>$null
  if ($LASTEXITCODE -ne 0) { Write-Error 'Falló el padding 9:16 del admin.'; exit 1 }

  $out = Join-Path $rec 'swapture-ad-9x16.mp4'
  $durOut9 = & ffmpeg -i $phonePad9 2>&1 | Select-String 'Duration:'
  $durLine9 = ($durOut9 | Select-Object -First 1).ToString()
  if ($durLine9 -match 'Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)') {
    $phoneDur9 = [double]::Parse($Matches[3], $ci)
  } else { $phoneDur9 = 20 }
  $offset9 = ([math]::Max(0, $phoneDur9 - $fadeDur)).ToString($ci)
  & ffmpeg -y -i $phonePad9 -i $admin9 `
    -filter_complex "[0:v][1:v]xfade=transition=fadeblack:duration=$fadeDurStr`:offset=$offset9`,format=yuv420p" `
    -r 30 -c:v libx264 -preset medium -crf 18 -movflags +faststart $out 2>$null
  if ($LASTEXITCODE -ne 0) { Write-Error 'Falló el crossfade 9:16 final.'; exit 1 }
  Write-Host "`n✅  Anuncio 9:16 generado: $out" -ForegroundColor Green
}

Write-Host '   Tip: la voz en off, SFX y los textos del storyboard se añaden'
Write-Host '        en tu editor (CapCut/Premiere) sobre este mp4 base.' -ForegroundColor DarkGray
