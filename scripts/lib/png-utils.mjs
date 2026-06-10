import { readFileSync, existsSync } from 'node:fs'
import { PNG } from 'pngjs'

export function readPngDimensions (filePath) {
  if (!existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`)
  }
  const buffer = readFileSync(filePath)
  if (buffer.length < 24 || buffer.toString('ascii', 1, 4) !== 'PNG') {
    throw new Error(`Not a PNG: ${filePath}`)
  }
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20)
  }
}

export function loadPng (filePath) {
  const buffer = readFileSync(filePath)
  return PNG.sync.read(buffer)
}

export function colorKey (r, g, b, a) {
  return `${r},${g},${b},${a}`
}

/** Opaque pixels only (alpha > 0). */
export function collectPalette (png) {
  const palette = new Map()
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const idx = (png.width * y + x) << 2
      const r = png.data[idx]
      const g = png.data[idx + 1]
      const b = png.data[idx + 2]
      const a = png.data[idx + 3]
      if (a === 0) continue
      const key = colorKey(r, g, b, a)
      palette.set(key, (palette.get(key) ?? 0) + 1)
    }
  }
  return palette
}

export function bboxOfOpaque (png, x0, y0, w, h) {
  let minX = w
  let minY = h
  let maxX = -1
  let maxY = -1
  let opaque = 0

  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) {
      const idx = (png.width * y + x) << 2
      const a = png.data[idx + 3]
      if (a === 0) continue
      opaque++
      if (x - x0 < minX) minX = x - x0
      if (y - y0 < minY) minY = y - y0
      if (x - x0 > maxX) maxX = x - x0
      if (y - y0 > maxY) maxY = y - y0
    }
  }

  if (opaque === 0) {
    return { opaque: 0, minX: 0, minY: 0, maxX: -1, maxY: -1, width: 0, height: 0 }
  }

  return {
    opaque,
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX + 1,
    height: maxY - minY + 1
  }
}

export function parseArgs (argv) {
  const args = { _: [] }
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i]
    if (token.startsWith('--')) {
      const key = token.slice(2)
      const next = argv[i + 1]
      if (next && !next.startsWith('--')) {
        args[key] = next
        i++
      } else {
        args[key] = true
      }
    } else {
      args._.push(token)
    }
  }
  return args
}

export function fail (message) {
  console.error(`✗ ${message}`)
  process.exit(1)
}

export function ok (message) {
  console.log(`✓ ${message}`)
}

export function warn (message) {
  console.log(`⚠ ${message}`)
}
