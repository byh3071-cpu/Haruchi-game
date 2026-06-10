#!/usr/bin/env node
/**
 * verify-wheel-ingame.mjs — simulate exactly what the browser renders:
 * bg.png drawn into .screen-top with object-fit:cover / object-position:30% bottom,
 * then the wheel overlay at the rect computed by computeWheelOverlayRect (same math
 * as tama/js/game.js). Renders frames for each theme size at 3x for inspection.
 */

import { writeFileSync } from 'node:fs'
import { PNG } from 'pngjs'
import { loadPng, ok } from './lib/png-utils.mjs'

const BG_NATIVE = { w: 1392, h: 768 }
const WHEEL_ALIGN = { leftPx: 18.9, topPx: 81.1, sizePx: 527.2 }
const CELL = 224

const THEMES = [
  { name: 'classic', w: 390, h: 280 },
  { name: 'white-black', w: 390, h: 255 },
  { name: 'haruchi1', w: 390, h: 225 }
]

const bg = loadPng('tama/assets/scene/bg.png')
const sheet = loadPng('tama/assets/animations/wheel_run.png')

// same math as game.js computeWheelOverlayRect
function overlayRect (cw, ch) {
  const scale = Math.max(cw / BG_NATIVE.w, ch / BG_NATIVE.h)
  const drawnW = BG_NATIVE.w * scale
  const drawnH = BG_NATIVE.h * scale
  const offsetX = (cw - drawnW) * 0.30
  const offsetY = ch - drawnH
  return {
    scale,
    offsetX,
    offsetY,
    left: offsetX + WHEEL_ALIGN.leftPx * scale,
    top: offsetY + WHEEL_ALIGN.topPx * scale,
    size: WHEEL_ALIGN.sizePx * scale
  }
}

function samplePng (png, x, y) {
  const xi = Math.min(png.width - 1, Math.max(0, Math.floor(x)))
  const yi = Math.min(png.height - 1, Math.max(0, Math.floor(y)))
  const i = ((png.width * yi + xi) << 2)
  return [png.data[i], png.data[i + 1], png.data[i + 2], png.data[i + 3]]
}

for (const theme of THEMES) {
  const { w: CW, h: CH } = theme
  const r = overlayRect(CW, CH)
  const ZOOM = 3
  const out = new PNG({ width: CW * ZOOM, height: CH * ZOOM })

  for (let y = 0; y < CH * ZOOM; y++) {
    for (let x = 0; x < CW * ZOOM; x++) {
      const cx = x / ZOOM
      const cy = y / ZOOM
      // bg cover sample
      const bgX = (cx - r.offsetX) / r.scale
      const bgY = (cy - r.offsetY) / r.scale
      let [pr, pg, pb] = samplePng(bg, bgX, bgY)

      // overlay frame sample (frame index by column thirds for variety below)
      const frame = 0
      if (cx >= r.left && cx < r.left + r.size && cy >= r.top && cy < r.top + r.size) {
        const fx = ((cx - r.left) / r.size) * CELL + frame * CELL
        const fy = ((cy - r.top) / r.size) * CELL
        const [or_, og, ob, oa] = samplePng(sheet, fx, fy)
        if (oa > 0) {
          const a = oa / 255
          pr = Math.round(or_ * a + pr * (1 - a))
          pg = Math.round(og * a + pg * (1 - a))
          pb = Math.round(ob * a + pb * (1 - a))
        }
      }

      const di = ((out.width * y + x) << 2)
      out.data[di] = pr
      out.data[di + 1] = pg
      out.data[di + 2] = pb
      out.data[di + 3] = 255
    }
  }

  const path = `tama/assets/animations/_candidates/verify_ingame_${theme.name}.png`
  writeFileSync(path, PNG.sync.write(out))
  ok(`${theme.name} (${CW}×${CH}): scale=${r.scale.toFixed(4)} overlay left=${r.left.toFixed(1)} top=${r.top.toFixed(1)} size=${r.size.toFixed(1)} → ${path}`)
}

// CSS steps math verification
console.log('\nCSS steps(7) frame mapping (background-size 800%):')
for (let k = 0; k <= 7; k++) {
  const posPct = (k / 7) * 100
  // offset = (W - 8W) * p = -7W * p ; frames at -kW
  const frameLanded = (7 * posPct) / 100
  console.log(`  step ${k}: position-x ${posPct.toFixed(3)}% → frame ${frameLanded.toFixed(3)}`)
}
console.log('finish: position-x 100% → frame 7 (정면 포즈) ✓')
