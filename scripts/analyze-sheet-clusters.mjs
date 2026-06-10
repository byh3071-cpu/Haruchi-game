#!/usr/bin/env node
/**
 * analyze-sheet-clusters.mjs — detect frame clusters in an irregular sprite sheet
 * by scanning fully-transparent column/row gaps.
 *
 * Usage: node scripts/analyze-sheet-clusters.mjs <png> [--alpha-min 8]
 */

import { loadPng, parseArgs, ok, fail } from './lib/png-utils.mjs'

const args = parseArgs(process.argv.slice(2))
const filePath = args._[0]
const alphaMin = args['alpha-min'] ? Number(args['alpha-min']) : 8

if (!filePath) fail('Usage: node scripts/analyze-sheet-clusters.mjs <png>')

const png = loadPng(filePath)
const { width, height, data } = png
ok(`${filePath} (${width}×${height})`)

function spansFromOccupancy (occupied) {
  const spans = []
  let start = -1
  for (let i = 0; i < occupied.length; i++) {
    if (occupied[i] && start === -1) start = i
    if (!occupied[i] && start !== -1) {
      spans.push({ start, end: i - 1, size: i - start })
      start = -1
    }
  }
  if (start !== -1) spans.push({ start, end: occupied.length - 1, size: occupied.length - start })
  return spans
}

const colOccupied = new Array(width).fill(false)
const rowOccupied = new Array(height).fill(false)

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const a = data[((width * y + x) << 2) + 3]
    if (a >= alphaMin) {
      colOccupied[x] = true
      rowOccupied[y] = true
    }
  }
}

const rowSpans = spansFromOccupancy(rowOccupied)
console.log(`\nRow bands (${rowSpans.length}):`)
for (const s of rowSpans) console.log(`  y ${s.start}–${s.end} (h=${s.size})`)

for (const band of rowSpans) {
  const bandCols = new Array(width).fill(false)
  for (let y = band.start; y <= band.end; y++) {
    for (let x = 0; x < width; x++) {
      if (bandCols[x]) continue
      const a = data[((width * y + x) << 2) + 3]
      if (a >= alphaMin) bandCols[x] = true
    }
  }
  const colSpans = spansFromOccupancy(bandCols)
  console.log(`\nBand y${band.start}–${band.end}: ${colSpans.length} clusters`)
  for (const s of colSpans) {
    console.log(`  x ${s.start}–${s.end} (w=${s.size})`)
  }
}
