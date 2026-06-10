#!/usr/bin/env node
/**
 * validate-sprite-sheet.mjs — sprite sheet grid & pixel contract checks
 *
 * Usage:
 *   node scripts/validate-sprite-sheet.mjs <png> --cols 4 --rows 2
 *   node scripts/validate-sprite-sheet.mjs <png> --cols 8 --rows 1 --cell-w 125 --cell-h 125
 *
 * Exit 0 = pass, 1 = fail
 */

import {
  loadPng,
  readPngDimensions,
  bboxOfOpaque,
  parseArgs,
  ok,
  warn,
  fail
} from './lib/png-utils.mjs'

const args = parseArgs(process.argv.slice(2))
const filePath = args._[0]

if (!filePath) {
  console.error('Usage: node scripts/validate-sprite-sheet.mjs <png> --cols N --rows N [--cell-w W] [--cell-h H] [--anchor-tolerance N]')
  process.exit(1)
}

const cols = Number(args.cols)
const rows = Number(args.rows)
const cellWArg = args['cell-w'] ? Number(args['cell-w']) : null
const cellHArg = args['cell-h'] ? Number(args['cell-h']) : null
const anchorTolerance = args['anchor-tolerance'] ? Number(args['anchor-tolerance']) : 2

if (!Number.isInteger(cols) || cols < 1 || !Number.isInteger(rows) || rows < 1) {
  fail('--cols and --rows must be positive integers')
}

let png
try {
  png = loadPng(filePath)
} catch (e) {
  fail(e.message)
}

const { width, height } = png
ok(`Loaded ${filePath} (${width}×${height})`)

if (width % cols !== 0) {
  fail(`Width ${width} not divisible by cols ${cols}`)
}
if (height % rows !== 0) {
  fail(`Height ${height} not divisible by rows ${rows}`)
}

const cellW = width / cols
const cellH = height / rows

if (!Number.isInteger(cellW) || !Number.isInteger(cellH)) {
  fail(`Cell size not integer: ${cellW}×${cellH}`)
}

ok(`Grid ${cols}×${rows} → cell ${cellW}×${cellH}px`)

if (cellWArg !== null && cellW !== cellWArg) {
  fail(`Expected cell-w ${cellWArg}, got ${cellW}`)
}
if (cellHArg !== null && cellH !== cellHArg) {
  fail(`Expected cell-h ${cellHArg}, got ${cellH}`)
}

if (cellW !== cellH) {
  warn(`Cells are not square (${cellW}×${cellH}) — confirm layout intentional`)
}

const bboxes = []
let semiTransparent = 0
let totalOpaque = 0

for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {
    const x0 = col * cellW
    const y0 = row * cellH
    const bbox = bboxOfOpaque(png, x0, y0, cellW, cellH)
    bboxes.push({ frame: row * cols + col, row, col, ...bbox })

    for (let y = y0; y < y0 + cellH; y++) {
      for (let x = x0; x < x0 + cellW; x++) {
        const idx = (png.width * y + x) << 2
        const a = png.data[idx + 3]
        if (a > 0 && a < 255) semiTransparent++
        if (a > 0) totalOpaque++
      }
    }
  }
}

if (semiTransparent > 0) {
  warn(`${semiTransparent} semi-transparent pixels (alpha 1–254) — pixel art prefers 0 or 255 only`)
}

const emptyFrames = bboxes.filter((b) => b.opaque === 0)
if (emptyFrames.length > 0) {
  fail(`Empty frame(s): ${emptyFrames.map((b) => b.frame).join(', ')}`)
}
ok(`All ${cols * rows} frames have opaque pixels`)

const anchorBottoms = bboxes.map((b) => b.maxY)
const anchorLefts = bboxes.map((b) => b.minX)
const bottomSpread = Math.max(...anchorBottoms) - Math.min(...anchorBottoms)
const leftSpread = Math.max(...anchorLefts) - Math.min(...anchorLefts)

if (bottomSpread > anchorTolerance) {
  fail(`Anchor bottom spread ${bottomSpread}px > tolerance ${anchorTolerance}px (frames may jump vertically)`)
}
if (leftSpread > anchorTolerance) {
  warn(`Anchor left spread ${leftSpread}px — horizontal shift across frames`)
}

ok(`Anchor bottom spread ${bottomSpread}px (≤${anchorTolerance}px)`)

const widths = bboxes.map((b) => b.width)
const heights = bboxes.map((b) => b.height)
const wSpread = Math.max(...widths) - Math.min(...widths)
const hSpread = Math.max(...heights) - Math.min(...heights)

if (wSpread > anchorTolerance * 2 || hSpread > anchorTolerance * 2) {
  warn(`Content bbox size varies: width spread ${wSpread}px, height spread ${hSpread}px`)
} else {
  ok(`Content bbox consistent across frames (w±${wSpread}px, h±${hSpread}px)`)
}

console.log('')
console.log('Frame summary:')
for (const b of bboxes) {
  console.log(
    `  #${b.frame} [${b.col},${b.row}] opaque=${b.opaque} bbox=${b.width}×${b.height} anchorBottom=${b.maxY}`
  )
}

console.log('')
ok(`validate-sprite-sheet PASS — ${filePath}`)
