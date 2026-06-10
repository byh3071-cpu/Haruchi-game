#!/usr/bin/env node
/**
 * measure-wheel-assets.mjs — Phase 1 measurements for WHEEL_ANIMATION_SPEC §8
 *
 * Usage: node scripts/measure-wheel-assets.mjs [--write]
 */

import { writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  loadPng,
  readPngDimensions,
  collectPalette,
  bboxOfOpaque,
  parseArgs,
  ok
} from './lib/png-utils.mjs'

const args = parseArgs(process.argv.slice(2))
const root = resolve(process.cwd())

const paths = {
  normal: 'tama/assets/hamster/normal.png',
  wheel: 'tama/assets/animations/wheel.png',
  grooming: 'tama/assets/animations/spr_hamster_shedding.png',
  bg: 'tama/assets/scene/bg.png'
}

const cssDisplay = {
  normalWidth: 290,
  normalHeight: 290,
  groomingOverlayDefault: 120
}

function gcd (a, b) {
  return b === 0 ? a : gcd(b, a % b)
}

function suggestIntegerScales (native, display) {
  const scales = []
  for (let s = 1; s <= 8; s++) {
    const scaled = native * s
    if (scaled <= 512) scales.push({ scale: s, display: scaled })
  }
  const ratioGcd = gcd(native, display)
  const isIntegerScale = display * ratioGcd === native * Math.round(display / (native / ratioGcd))
  return { scales, displayIsIntegerScaleOfNative: Number.isInteger(display / native) || (native % display === 0) || (display % native === 0) }
}

const report = {
  measuredAt: new Date().toISOString().slice(0, 10),
  files: {},
  css: cssDisplay,
  splitV1Targets: {
    wheel_hamster: { cols: 4, rows: 2, frames: 8 },
    wheel_base: { cols: 1, rows: 1, frames: 1 }
  },
  recommendations: {}
}

for (const [key, rel] of Object.entries(paths)) {
  const full = resolve(root, rel)
  if (!existsSync(full)) {
    report.files[key] = { path: rel, missing: true }
    continue
  }
  const dim = readPngDimensions(full)
  const entry = { path: rel, width: dim.width, height: dim.height }

  if (key === 'normal') {
    const png = loadPng(full)
    const palette = collectPalette(png)
    const bbox = bboxOfOpaque(png, 0, 0, dim.width, dim.height)
    entry.opaqueColors = palette.size
    entry.contentBbox = bbox
    const scaleInfo = suggestIntegerScales(dim.width, cssDisplay.normalWidth)
    entry.displayScale = cssDisplay.normalWidth / dim.width
    entry.integerScaleRecommended = scaleInfo.scales
    report.recommendations.hamsterDisplay = {
      note: 'Current CSS 290px on 500px native is NOT integer scale (0.58×) — existing debt',
      nearestIntegerScales: scaleInfo.scales
    }
  }

  if (key === 'grooming') {
    const cell = dim.width / 4
    entry.grid = '4×4'
    entry.cellW = cell
    entry.cellH = dim.height / 4
    entry.overlayDisplay = cssDisplay.groomingOverlayDefault
    entry.overlayScale = cssDisplay.groomingOverlayDefault / cell
  }

  if (key === 'wheel') {
    const cellW4 = dim.width / 4
    const cellH2 = dim.height / 2
    entry.possibleGrids = [
      { cols: 4, rows: 2, cellW: cellW4, cellH: cellH2 },
      { cols: 2, rows: 4, cellW: dim.width / 2, cellH: dim.height / 4 },
      { cols: 8, rows: 1, cellW: dim.width / 8, cellH: dim.height }
    ]
    try {
      const png = loadPng(full)
      const bboxes = []
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 4; col++) {
          bboxes.push(bboxOfOpaque(png, col * cellW4, row * cellH2, cellW4, cellH2))
        }
      }
      entry.frameBboxes4x2 = bboxes
    } catch {
      /* skip */
    }
  }

  report.files[key] = entry
  ok(`${rel}: ${dim.width}×${dim.height}`)
}

const normalW = report.files.normal?.width ?? 500
report.recommendations.splitV1CellSize = {
  optionA_matchNormalCanvas: `${normalW}×${normalW} per frame (large)`,
  optionB_matchGroomingCell: '125×125 per frame (matches grooming grid)',
  optionC_matchGroomingRow: '125×250 per frame (4×2 on 500×500 sheet like current wheel.png)',
  chosenForPhase2: '125×125 cells on 1000×250 hamster sheet (8×1) + 125×125 wheel_base — TBD after validate pass'
}

console.log('')
console.log(JSON.stringify(report, null, 2))

const outPath = resolve(root, 'docs/planning/wheel-assets-measurement.json')
if (args.write) {
  writeFileSync(outPath, JSON.stringify(report, null, 2) + '\n', 'utf-8')
  ok(`Wrote ${outPath}`)
} else {
  console.log('')
  console.log(`(Run with --write to save docs/planning/wheel-assets-measurement.json)`)
}
