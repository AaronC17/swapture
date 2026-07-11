/**
 * generate-sfx.js
 * ---------------------------------------------------------------------------
 * Genera efectos de sonido (SFX) sintéticos para el anuncio de Swapture.
 * No requiere archivos externos: crea WAVs de 16 bits usando operaciones matemáticas.
 *
 * Salida: recordings/sfx/*.wav
 */
const fs = require('fs')
const path = require('path')

const SAMPLE_RATE = 44100
const OUT_DIR = path.join(__dirname, '..', 'recordings', 'sfx')

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function writeWav(samples, outFile, { sampleRate = SAMPLE_RATE, channels = 1 } = {}) {
  const bytesPerSample = 2
  const blockAlign = channels * bytesPerSample
  const byteRate = sampleRate * blockAlign
  const dataSize = samples.length * bytesPerSample
  const fileSize = dataSize + 36

  const buffer = Buffer.alloc(44 + dataSize)
  let offset = 0
  buffer.write('RIFF', offset); offset += 4
  buffer.writeUInt32LE(fileSize, offset); offset += 4
  buffer.write('WAVE', offset); offset += 4
  buffer.write('fmt ', offset); offset += 4
  buffer.writeUInt32LE(16, offset); offset += 4
  buffer.writeUInt16LE(1, offset); offset += 2 // PCM
  buffer.writeUInt16LE(channels, offset); offset += 2
  buffer.writeUInt32LE(sampleRate, offset); offset += 4
  buffer.writeUInt32LE(byteRate, offset); offset += 4
  buffer.writeUInt16LE(blockAlign, offset); offset += 2
  buffer.writeUInt16LE(16, offset); offset += 2
  buffer.write('data', offset); offset += 4
  buffer.writeUInt32LE(dataSize, offset); offset += 4

  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]))
    buffer.writeInt16LE(Math.round(s * 32767), offset)
    offset += 2
  }

  fs.writeFileSync(outFile, buffer)
}

function adsrEnvelope(length, { attack = 0.01, decay = 0.1, sustain = 0.7, release = 0.2 } = {}) {
  const env = new Float32Array(length)
  const aSamples = Math.floor(attack * SAMPLE_RATE)
  const dSamples = Math.floor(decay * SAMPLE_RATE)
  const rSamples = Math.floor(release * SAMPLE_RATE)
  const sStart = aSamples + dSamples
  const sEnd = length - rSamples

  for (let i = 0; i < length; i++) {
    if (i < aSamples) {
      env[i] = i / aSamples
    } else if (i < sStart) {
      env[i] = 1 - ((1 - sustain) * (i - aSamples) / dSamples)
    } else if (i < sEnd) {
      env[i] = sustain
    } else {
      env[i] = sustain * (length - i) / rSamples
    }
  }
  return env
}

function sine(freq, duration, envelopeOpts) {
  const length = Math.floor(duration * SAMPLE_RATE)
  const samples = new Float32Array(length)
  const env = adsrEnvelope(length, envelopeOpts)
  for (let i = 0; i < length; i++) {
    samples[i] = Math.sin(2 * Math.PI * freq * i / SAMPLE_RATE) * env[i]
  }
  return samples
}

function noise(duration, envelopeOpts, { toneMix = 0 } = {}) {
  const length = Math.floor(duration * SAMPLE_RATE)
  const samples = new Float32Array(length)
  const env = adsrEnvelope(length, envelopeOpts)
  for (let i = 0; i < length; i++) {
    let v = (Math.random() * 2 - 1)
    if (toneMix > 0) {
      v = v * (1 - toneMix) + Math.sin(2 * Math.PI * 200 * i / SAMPLE_RATE) * toneMix
    }
    samples[i] = v * env[i]
  }
  return samples
}

function twoTone(freq1, freq2, duration, envelopeOpts) {
  const length = Math.floor(duration * SAMPLE_RATE)
  const samples = new Float32Array(length)
  const env = adsrEnvelope(length, envelopeOpts)
  for (let i = 0; i < length; i++) {
    const t = i / SAMPLE_RATE
    samples[i] = (
      Math.sin(2 * Math.PI * freq1 * t) * 0.5 +
      Math.sin(2 * Math.PI * freq2 * t) * 0.5
    ) * env[i]
  }
  return samples
}

function combine(...buffers) {
  const maxLen = Math.max(...buffers.map((b) => b.length))
  const out = new Float32Array(maxLen)
  for (const buf of buffers) {
    for (let i = 0; i < buf.length; i++) {
      out[i] += buf[i]
    }
  }
  // normalize
  const peak = Math.max(...out.map((v) => Math.abs(v)))
  if (peak > 1) {
    for (let i = 0; i < out.length; i++) out[i] /= peak
  }
  return out
}

function fadeInOut(samples, fadeIn = 0.05, fadeOut = 0.05) {
  const fiSamples = Math.floor(fadeIn * SAMPLE_RATE)
  const foSamples = Math.floor(fadeOut * SAMPLE_RATE)
  for (let i = 0; i < samples.length; i++) {
    if (i < fiSamples) samples[i] *= i / fiSamples
    else if (i >= samples.length - foSamples) {
      samples[i] *= (samples.length - i) / foSamples
    }
  }
  return samples
}

// ───────────────────────────────────────────────────────────────────────────
// CATÁLOGO DE SFX
// ───────────────────────────────────────────────────────────────────────────

const catalog = {
  'tick.wav': () => sine(1000, 0.08, { attack: 0.005, decay: 0.03, sustain: 0, release: 0.05 }),
  'tap.wav': () => fadeInOut(noise(0.05, { attack: 0.001, decay: 0.01, sustain: 0, release: 0.03 })),
  'pop.wav': () => {
    const length = Math.floor(0.12 * SAMPLE_RATE)
    const samples = new Float32Array(length)
    const env = adsrEnvelope(length, { attack: 0.005, decay: 0.04, sustain: 0, release: 0.07 })
    for (let i = 0; i < length; i++) {
      const freq = 600 + (i / length) * 600
      samples[i] = Math.sin(2 * Math.PI * freq * i / SAMPLE_RATE) * env[i]
    }
    return samples
  },
  'ding.wav': () => twoTone(523.25, 659.25, 0.55, { attack: 0.005, decay: 0.35, sustain: 0.1, release: 0.4 }),
  'ding-cart.wav': () => twoTone(880, 1108.73, 0.4, { attack: 0.005, decay: 0.15, sustain: 0.1, release: 0.25 }),
  'ding-admin.wav': () => combine(
    twoTone(523.25, 783.99, 0.6, { attack: 0.005, decay: 0.25, sustain: 0.15, release: 0.5 }),
    sine(1046.5, 0.6, { attack: 0.02, decay: 0.25, sustain: 0.1, release: 0.5 }).map((v, i) => v * (i > 0.1 * SAMPLE_RATE ? 1 : 0))
  ),
  'cha-ching.wav': () => {
    const a = twoTone(880, 1108.73, 0.25, { attack: 0.005, decay: 0.1, sustain: 0.1, release: 0.15 })
    const b = twoTone(1174.66, 1396.91, 0.3, { attack: 0.005, decay: 0.1, sustain: 0.1, release: 0.2 })
    const c = twoTone(1567.98, 1975.53, 0.35, { attack: 0.005, decay: 0.12, sustain: 0.1, release: 0.25 })
    const length = Math.floor(0.7 * SAMPLE_RATE)
    const out = new Float32Array(length)
    for (let i = 0; i < a.length; i++) out[i] += a[i] * 0.5
    for (let i = 0; i < b.length; i++) out[i + Math.floor(0.12 * SAMPLE_RATE)] += b[i] * 0.5
    for (let i = 0; i < c.length; i++) out[i + Math.floor(0.28 * SAMPLE_RATE)] += c[i] * 0.5
    return out
  },
  'whoosh.wav': () => {
    const length = Math.floor(0.45 * SAMPLE_RATE)
    const samples = new Float32Array(length)
    for (let i = 0; i < length; i++) {
      const t = i / length
      const env = Math.sin(t * Math.PI) // rise-fall
      samples[i] = (Math.random() * 2 - 1) * env
    }
    return fadeInOut(samples, 0.02, 0.15)
  },
  'swoosh.wav': () => {
    const length = Math.floor(0.3 * SAMPLE_RATE)
    const samples = new Float32Array(length)
    for (let i = 0; i < length; i++) {
      const t = i / length
      const env = Math.pow(t, 0.5) * Math.pow(1 - t, 2)
      samples[i] = (Math.random() * 2 - 1) * env
    }
    return fadeInOut(samples, 0.01, 0.1)
  },
  'impact.wav': () => combine(
    sine(120, 0.35, { attack: 0.001, decay: 0.15, sustain: 0.05, release: 0.25 }),
    noise(0.35, { attack: 0.001, decay: 0.08, sustain: 0.1, release: 0.2 }, { toneMix: 0.3 }).map((v) => v * 0.6)
  ),
  'impact-final.wav': () => combine(
    sine(80, 0.7, { attack: 0.001, decay: 0.3, sustain: 0.1, release: 0.5 }),
    noise(0.8, { attack: 0.001, decay: 0.25, sustain: 0.15, release: 0.5 }, { toneMix: 0.2 }).map((v) => v * 0.5),
    twoTone(523.25, 783.99, 0.8, { attack: 0.001, decay: 0.3, sustain: 0.1, release: 0.5 }).map((v) => v * 0.3)
  ),
  'keyboard.wav': () => {
    const duration = 0.8
    const length = Math.floor(duration * SAMPLE_RATE)
    const out = new Float32Array(length)
    let pos = 0
    while (pos < length - 0.03 * SAMPLE_RATE) {
      const tick = sine(1200 + Math.random() * 600, 0.02 + Math.random() * 0.03, {
        attack: 0.001, decay: 0.01, sustain: 0, release: 0.02,
      })
      for (let i = 0; i < tick.length && pos + i < length; i++) {
        out[pos + i] += tick[i] * 0.4
      }
      pos += Math.floor((0.04 + Math.random() * 0.08) * SAMPLE_RATE)
    }
    return fadeInOut(out, 0.02, 0.05)
  },
  'swell.wav': () => {
    const length = Math.floor(2.0 * SAMPLE_RATE)
    const samples = new Float32Array(length)
    for (let i = 0; i < length; i++) {
      const t = i / length
      const env = Math.pow(t, 0.7) * Math.pow(1 - t, 0.3)
      samples[i] = (Math.random() * 2 - 1) * env * 0.4
    }
    return fadeInOut(samples, 0.3, 0.5)
  },
}

async function main() {
  ensureDir(OUT_DIR)
  console.log('🔊 Generando efectos de sonido...')

  for (const [file, generator] of Object.entries(catalog)) {
    const outFile = path.join(OUT_DIR, file)
    if (fs.existsSync(outFile)) {
      console.log(`  · ${file} ya existe, se reusa`)
      continue
    }
    const samples = generator()
    writeWav(samples, outFile)
    console.log(`  · ${file} generado (${(samples.length / SAMPLE_RATE).toFixed(2)}s)`)
  }

  console.log(`\n✅ SFX listos en: ${OUT_DIR}`)
}

main().catch((err) => {
  console.error('\n❌ Error generando SFX:', err)
  process.exit(1)
})
