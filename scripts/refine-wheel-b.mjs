#!/usr/bin/env node
/**
 * refine-wheel-b.mjs — align candidate B frames by static structure (wheel+ladder)
 * using cross-correlation of opaque masks against frame 0, then write the
 * production sheet tama/assets/animations/wheel_run.png (8×1, 224×224 cells).
 *
 * Frames 0–6: run loop. Frame 7: front-facing finish pose (played once on stop).
 */

import { writeFileSync } from 'node:fs'
import { PNG } from 'pngjs'
import { loadPng, bboxOfOpaque, ok, warn } from './lib/png-utils.mjs'

const SRC = 'tama/assets/animations/_candidates/candidateB_run_8x1.png'
const OUT = 'tama/assets/animations/wheel_run.png'
const CELL = 224
const FRAMES = 8
const SEARCH = 10 // max shift in px

const src = loadPng(SRC)

function maskOf (frame) {
  const m = new Uint8Array(CELL * CELL)
  for (let y = 0; y < CELL; y++) {
    for (let x = 0; x < CELL; x++) {
      const idx = ((src.width * y + (frame * CELL + x)) << 2) + 3
      m[y * CELL + x] = src.data[idx] >= 64 ? 1 : 0
    }
  }
  return m
}

function overlapScore (ref, m, dx, dy) {
  let score = 0
  for (let y = 0; y < CELL; y++) {
    const sy = y - dy
    if (sy < 0 || sy >= CELL) continue
    for (let x = 0; x < CELL; x++) {
      const sx = x - dx
      if (sx < 0 || sx >= CELL) continue
      if (ref[y * CELL + x] && m[sy * CELL + sx]) score++
    }
  }
  return score
}

const refMask = maskOf(0)
const offsets = [{ dx: 0, dy: 0 }]

for (let f = 1; f < FRAMES; f++) {
  const m = maskOf(f)
  let best = { dx: 0, dy: 0, score: -1 }
  for (let dy = -SEARCH; dy <= SEARCH; dy++) {
    for (let dx = -SEARCH; dx <= SEARCH; dx++) {
      const s = overlapScore(refMask, m, dx, dy)
      if (s > best.score) best = { dx, dy, score: s }
    }
  }
  offsets.push(best)
  console.log(`frame ${f}: shift dx=${best.dx} dy=${best.dy} (overlap ${best.score})`)
}

const out = new PNG({ width: CELL * FRAMES, height: CELL })

for (let f = 0; f < FRAMES; f++) {
  const { dx, dy } = offsets[f]
  for (let y = 0; y < CELL; y++) {
    const sy = y - dy
    if (sy < 0 || sy >= CELL) continue
    for (let x = 0; x < CELL; x++) {
      const sx = x - dx
      if (sx < 0 || sx >= CELL) continue
      const sIdx = ((src.width * sy + (f * CELL + sx)) << 2)
      const a = src.data[sIdx + 3]
      if (a === 0) continue
      const dIdx = ((out.width * y + (f * CELL + x)) << 2)
      out.data[dIdx] = src.data[sIdx]
      out.data[dIdx + 1] = src.data[sIdx + 1]
      out.data[dIdx + 2] = src.data[sIdx + 2]
      out.data[dIdx + 3] = a
    }
  }
}

writeFileSync(OUT, PNG.sync.write(out))
ok(`wrote ${OUT} (${CELL * FRAMES}×${CELL})`)

// post-alignment bbox check
const aligned = loadPng(OUT)
const bottoms = []
for (let f = 0; f < FRAMES; f++) {
  const b = bboxOfOpaque(aligned, f * CELL, 0, CELL, CELL)
  bottoms.push(b.maxY)
  console.log(`frame ${f}: bbox ${b.width}×${b.height} bottom=${b.maxY}`)
}
const spread = Math.max(...bottoms) - Math.min(...bottoms)
if (spread > 4) warn(`anchor bottom spread after align: ${spread}px`)
else ok(`anchor bottom spread after align: ${spread}px`)
