#!/usr/bin/env node
/**
 * compare-palette.mjs — check candidate PNG uses colors from reference palette
 *
 * Usage:
 *   node scripts/compare-palette.mjs --ref tama/assets/hamster/normal.png --target <candidate.png>
 *   node scripts/compare-palette.mjs --ref normal.png --target wheel.png --max-foreign-pct 5
 *
 * Exit 0 = pass, 1 = fail
 */

import { writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import {
  loadPng,
  collectPalette,
  colorKey,
  parseArgs,
  ok,
  warn,
  fail
} from './lib/png-utils.mjs'

const args = parseArgs(process.argv.slice(2))
const refPath = args.ref
const targetPath = args.target
const maxForeignPct = args['max-foreign-pct'] ? Number(args['max-foreign-pct']) : 2
const exportPath = args.export ? resolve(args.export) : null

if (!refPath || !targetPath) {
  console.error('Usage: node scripts/compare-palette.mjs --ref <reference.png> --target <candidate.png> [--max-foreign-pct N] [--export palette.json]')
  process.exit(1)
}

let refPng
let targetPng
try {
  refPng = loadPng(refPath)
  targetPng = loadPng(targetPath)
} catch (e) {
  fail(e.message)
}

const refPalette = collectPalette(refPng)
const refKeys = new Set(refPalette.keys())

ok(`Reference ${refPath}: ${refKeys.size} unique opaque colors`)
ok(`Target ${targetPath}: ${targetPng.width}×${targetPng.height}`)

let foreignPixels = 0
let opaquePixels = 0
const foreignColors = new Map()

for (let y = 0; y < targetPng.height; y++) {
  for (let x = 0; x < targetPng.width; x++) {
    const idx = (targetPng.width * y + x) << 2
    const r = targetPng.data[idx]
    const g = targetPng.data[idx + 1]
    const b = targetPng.data[idx + 2]
    const a = targetPng.data[idx + 3]
    if (a === 0) continue
    opaquePixels++
    const key = colorKey(r, g, b, a)
    if (!refKeys.has(key)) {
      foreignPixels++
      foreignColors.set(key, (foreignColors.get(key) ?? 0) + 1)
    }
  }
}

if (opaquePixels === 0) {
  fail('Target has no opaque pixels')
}

const foreignPct = (foreignPixels / opaquePixels) * 100
ok(`Opaque pixels: ${opaquePixels}`)
console.log(`Foreign palette pixels: ${foreignPixels} (${foreignPct.toFixed(2)}%)`)

if (foreignColors.size > 0) {
  const top = [...foreignColors.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
  console.log('Top foreign colors (rgba:count):')
  for (const [key, count] of top) {
    console.log(`  ${key} × ${count}`)
  }
}

if (exportPath) {
  const paletteJson = {
    source: refPath,
    generatedAt: new Date().toISOString().slice(0, 10),
    colorCount: refKeys.size,
    colors: [...refPalette.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([key, count]) => {
        const [r, g, b, a] = key.split(',').map(Number)
        return { r, g, b, a, count }
      })
  }
  mkdirSync(dirname(exportPath), { recursive: true })
  writeFileSync(exportPath, JSON.stringify(paletteJson, null, 2) + '\n', 'utf-8')
  ok(`Exported reference palette → ${exportPath}`)
}

if (foreignPct > maxForeignPct) {
  fail(`Foreign pixel ratio ${foreignPct.toFixed(2)}% exceeds max ${maxForeignPct}%`)
}

ok(`compare-palette PASS (≤${maxForeignPct}% foreign)`)
