#!/usr/bin/env node
/**
 * measure-wheel-alignment.mjs — compute exact scale/position to overlay
 * wheel_run.png frames onto the static wheel in bg.png.
 *
 * Method: detect the wooden rim (brown hues) row-by-row, find the widest
 * horizontal span = circle diameter row → center + diameter for both images,
 * then solve scale = bgDiameter / frameDiameter and the top-left offset.
 * Writes a composite proof image.
 */

import { writeFileSync } from 'node:fs'
import { PNG } from 'pngjs'
import { loadPng, ok } from './lib/png-utils.mjs'

function isRimBrown (r, g, b, a) {
  if (a < 200) return false
  return r >= 120 && r <= 230 && g >= 80 && g <= 180 && b >= 40 && b <= 140 && r > g && g > b
}

/** Find circle (center, diameter) via widest brown span per row. */
function detectCircle (png, x0, y0, x1, y1) {
  let best = { row: -1, left: 0, right: 0, width: 0 }
  const rows = []
  for (let y = y0; y < y1; y++) {
    let left = -1
    let right = -1
    for (let x = x0; x < x1; x++) {
      const i = ((png.width * y + x) << 2)
      if (isRimBrown(png.data[i], png.data[i + 1], png.data[i + 2], png.data[i + 3])) {
        if (left === -1) left = x
        right = x
      }
    }
    if (left !== -1) {
      const width = right - left + 1
      rows.push({ y, left, right, width })
      if (width > best.width) best = { row: y, left, right, width }
    }
  }
  // circle top = first row where brown appears, near-symmetric span
  const top = rows.length ? rows[0].y : -1
  // circle bottom estimate: top + diameter
  return {
    centerX: (best.left + best.right) / 2,
    centerY: top + best.width / 2,
    diameter: best.width,
    top,
    widestRow: best.row,
    left: best.left,
    right: best.right
  }
}

const bg = loadPng('tama/assets/scene/bg.png')
const sheet = loadPng('tama/assets/animations/wheel_run.png')
const CELL = 224

// bg: wheel sits in left part; cap y at 295 to exclude bedding browns,
// start y at 40 to capture the true rim top
const bgCircle = detectCircle(bg, 30, 40, 400, 295)
ok(`bg wheel: center (${bgCircle.centerX}, ${bgCircle.centerY.toFixed(1)}) diameter ${bgCircle.diameter} (top y=${bgCircle.top}, widest row y=${bgCircle.widestRow})`)

// frame 0 of the sheet
const fCircle = detectCircle(sheet, 0, 0, CELL, CELL)
ok(`frame wheel: center (${fCircle.centerX}, ${fCircle.centerY.toFixed(1)}) diameter ${fCircle.diameter} (top y=${fCircle.top})`)

const scale = bgCircle.diameter / fCircle.diameter
const offsetX = bgCircle.centerX - fCircle.centerX * scale
const offsetY = bgCircle.centerY - fCircle.centerY * scale

console.log('')
console.log(`scale          : ${scale.toFixed(4)}  (display cell ${(CELL * scale).toFixed(1)}px)`)
console.log(`overlay left   : ${offsetX.toFixed(1)}px  = ${(offsetX / bg.width * 100).toFixed(2)}% of bg width`)
console.log(`overlay top    : ${offsetY.toFixed(1)}px  = ${(offsetY / bg.height * 100).toFixed(2)}% of bg height`)
console.log(`overlay size   : ${(CELL * scale / bg.width * 100).toFixed(2)}% of bg width`)

// composite proof: draw frame 0 scaled (nearest neighbor) onto bg copy
const out = new PNG({ width: bg.width, height: bg.height })
bg.data.copy(out.data)

for (let dy = 0; dy < Math.round(CELL * scale); dy++) {
  const sy = Math.min(CELL - 1, Math.floor(dy / scale))
  const ty = Math.round(offsetY) + dy
  if (ty < 0 || ty >= bg.height) continue
  for (let dx = 0; dx < Math.round(CELL * scale); dx++) {
    const sx = Math.min(CELL - 1, Math.floor(dx / scale))
    const tx = Math.round(offsetX) + dx
    if (tx < 0 || tx >= bg.width) continue
    const sIdx = ((sheet.width * sy + sx) << 2)
    const a = sheet.data[sIdx + 3]
    if (a === 0) continue
    const dIdx = ((out.width * ty + tx) << 2)
    const alpha = a / 255
    out.data[dIdx] = Math.round(sheet.data[sIdx] * alpha + out.data[dIdx] * (1 - alpha))
    out.data[dIdx + 1] = Math.round(sheet.data[sIdx + 1] * alpha + out.data[dIdx + 1] * (1 - alpha))
    out.data[dIdx + 2] = Math.round(sheet.data[sIdx + 2] * alpha + out.data[dIdx + 2] * (1 - alpha))
    out.data[dIdx + 3] = 255
  }
}

const proofPath = 'tama/assets/animations/_candidates/qa_alignment_proof.png'
writeFileSync(proofPath, PNG.sync.write(out))
ok(`wrote ${proofPath}`)

const result = {
  measuredAt: new Date().toISOString().slice(0, 10),
  bgWheel: bgCircle,
  frameWheel: fCircle,
  scale: Number(scale.toFixed(4)),
  overlay: {
    leftPx: Number(offsetX.toFixed(1)),
    topPx: Number(offsetY.toFixed(1)),
    leftPct: Number((offsetX / bg.width * 100).toFixed(2)),
    topPct: Number((offsetY / bg.height * 100).toFixed(2)),
    widthPct: Number((CELL * scale / bg.width * 100).toFixed(2))
  }
}
writeFileSync('docs/planning/wheel-alignment.json', JSON.stringify(result, null, 2) + '\n', 'utf-8')
ok('wrote docs/planning/wheel-alignment.json')
