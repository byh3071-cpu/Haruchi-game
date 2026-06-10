#!/usr/bin/env node
/**
 * extract-wheel-candidates.mjs — Phase 2 candidate extraction (no new art).
 *
 * Candidate A: legacy tama/assets/animations/wheel.png (4×2, cell 125×250,
 *   content 125×125 with per-row vertical offset) → normalized 8×1 sheet.
 * Candidate B: tama/assets/hamster/run.png (irregular clusters)
 *   → content-detected frames, anchored bottom-center on uniform canvas → 8×1 sheet.
 *
 * Output: tama/assets/animations/_candidates/ (preview only — NOT final SoT)
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import { PNG } from 'pngjs'
import { loadPng, bboxOfOpaque, ok, warn } from './lib/png-utils.mjs'

const OUT_DIR = 'tama/assets/animations/_candidates'
mkdirSync(OUT_DIR, { recursive: true })

function blit (src, sx, sy, w, h, dst, dx, dy) {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const sIdx = ((src.width * (sy + y) + (sx + x)) << 2)
      const dIdx = ((dst.width * (dy + y) + (dx + x)) << 2)
      dst.data[sIdx % 1 === 0 ? dIdx : dIdx] = src.data[sIdx]
      dst.data[dIdx] = src.data[sIdx]
      dst.data[dIdx + 1] = src.data[sIdx + 1]
      dst.data[dIdx + 2] = src.data[sIdx + 2]
      dst.data[dIdx + 3] = src.data[sIdx + 3]
    }
  }
}

function savePng (png, path) {
  writeFileSync(path, PNG.sync.write(png))
  ok(`wrote ${path}`)
}

/* ---------- Candidate A: legacy wheel.png ---------- */
{
  const src = loadPng('tama/assets/animations/wheel.png')
  const cellW = 125
  const cellH = 250
  const frameSize = 125
  const sheet = new PNG({ width: frameSize * 8, height: frameSize })

  for (let row = 0; row < 2; row++) {
    for (let col = 0; col < 4; col++) {
      const frame = row * 4 + col
      const x0 = col * cellW
      const y0 = row * cellH
      const bbox = bboxOfOpaque(src, x0, y0, cellW, cellH)
      // center content horizontally, align bottom of content to bottom of cell - 0
      const srcY = y0 + bbox.minY + Math.max(0, bbox.height - frameSize)
      const copyH = Math.min(frameSize, bbox.height)
      const dy = frameSize - copyH
      blit(src, x0, srcY, cellW, copyH, sheet, frame * frameSize, dy)
    }
  }
  savePng(sheet, `${OUT_DIR}/candidateA_legacy_wheel_8x1.png`)

  // 2x preview of frame 0 for style check
  const f0 = new PNG({ width: frameSize, height: frameSize })
  blit(sheet, 0, 0, frameSize, frameSize, f0, 0, 0)
  savePng(f0, `${OUT_DIR}/candidateA_frame0.png`)
}

/* ---------- Candidate B: run.png ---------- */
{
  const src = loadPng('tama/assets/hamster/run.png')
  const alphaMin = 8

  // clusters measured by analyze-sheet-clusters.mjs (ghost pixels excluded)
  const clusters = [
    { x0: 33, x1: 186, y0: 45, y1: 268 },
    { x0: 309, x1: 461, y0: 45, y1: 268 },
    { x0: 601, x1: 751, y0: 45, y1: 268 },
    { x0: 880, x1: 1034, y0: 45, y1: 268 },
    { x0: 32, x1: 182, y0: 349, y1: 563 },
    { x0: 314, x1: 462, y0: 349, y1: 563 },
    { x0: 598, x1: 743, y0: 349, y1: 563 },
    { x0: 876, x1: 1030, y0: 349, y1: 563 }
  ]

  const canvas = 224
  const sheet = new PNG({ width: canvas * 8, height: canvas })

  clusters.forEach((c, i) => {
    const w = c.x1 - c.x0 + 1
    const h = c.y1 - c.y0 + 1
    // tighten bbox within cluster (alpha >= alphaMin) to drop stray haze
    const sub = new PNG({ width: w, height: h })
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const sIdx = ((src.width * (c.y0 + y) + (c.x0 + x)) << 2)
        const dIdx = ((w * y + x) << 2)
        const a = src.data[sIdx + 3]
        if (a < alphaMin) continue
        sub.data[dIdx] = src.data[sIdx]
        sub.data[dIdx + 1] = src.data[sIdx + 1]
        sub.data[dIdx + 2] = src.data[sIdx + 2]
        sub.data[dIdx + 3] = a
      }
    }
    const bbox = bboxOfOpaque(sub, 0, 0, w, h)
    if (bbox.width > canvas || bbox.height > canvas) {
      warn(`frame ${i}: content ${bbox.width}×${bbox.height} exceeds canvas ${canvas}`)
    }
    const dx = i * canvas + Math.floor((canvas - bbox.width) / 2)
    const dy = canvas - bbox.height
    blit(sub, bbox.minX, bbox.minY, bbox.width, bbox.height, sheet, dx, dy)
    console.log(`  B frame ${i}: content ${bbox.width}×${bbox.height}`)
  })

  savePng(sheet, `${OUT_DIR}/candidateB_run_8x1.png`)

  const f0 = new PNG({ width: canvas, height: canvas })
  blit(sheet, 0, 0, canvas, canvas, f0, 0, 0)
  savePng(f0, `${OUT_DIR}/candidateB_frame0.png`)
}

/* ---------- Reference: bg.png wheel crop ---------- */
{
  const src = loadPng('tama/assets/scene/bg.png')
  // static wheel region in bg.png (left side)
  const x0 = 60; const y0 = 90; const w = 320; const h = 420
  const crop = new PNG({ width: w, height: h })
  blit(src, x0, y0, w, h, crop, 0, 0)
  savePng(crop, `${OUT_DIR}/reference_bg_wheel_crop.png`)
}

ok('extraction done — candidates in ' + OUT_DIR)
