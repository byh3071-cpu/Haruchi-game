#!/usr/bin/env node
/**
 * browser-verify-wheel.mjs — real-browser E2E verification of the wheel animation.
 * Serves tama/ on localhost (Pro default), launches system Chrome headless,
 * starts the game, presses D, and captures screenshots of every phase.
 *
 * Output: docs/qa/browser-shots/
 */

import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { mkdirSync } from 'node:fs'
import { extname, join } from 'node:path'
import puppeteer from 'puppeteer-core'

const ROOT = 'tama'
const PORT = 4173
const OUT = 'docs/qa/browser-shots'
mkdirSync(OUT, { recursive: true })

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg',
  '.json': 'application/json'
}

const server = createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname)
    const filePath = join(ROOT, urlPath === '/' ? 'index.html' : urlPath)
    const body = await readFile(filePath)
    res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] ?? 'application/octet-stream' })
    res.end(body)
  } catch {
    res.writeHead(404)
    res.end('not found')
  }
})

await new Promise((resolve) => server.listen(PORT, resolve))
console.log(`serving ${ROOT}/ on http://localhost:${PORT}`)

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
  args: ['--mute-audio', '--window-size=900,900']
})

const page = await browser.newPage()
await page.setViewport({ width: 900, height: 900 })

const consoleErrors = []
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text())
})
page.on('pageerror', (err) => consoleErrors.push('pageerror: ' + err.message))
page.on('requestfailed', (req) => consoleErrors.push('requestfailed: ' + req.url()))
page.on('response', (res) => {
  if (res.status() === 404) consoleErrors.push('404: ' + res.url())
})

await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'networkidle0' })

const isPro = await page.evaluate(() => window.IS_PRO)
console.log('IS_PRO =', isPro)

// start the game
await page.evaluate(() => startGame())
await new Promise((r) => setTimeout(r, 1500))
await page.screenshot({ path: `${OUT}/01_game_started.png` })
console.log('shot: 01_game_started')

const overlayInfoBefore = await page.evaluate(() => {
  const el = document.getElementById('wheelOverlay')
  return { exists: !!el, display: el ? getComputedStyle(el).display : null }
})
console.log('overlay before D:', JSON.stringify(overlayInfoBefore))

// press D — schedule shots on absolute deadlines so screenshot overhead
// doesn't shift the timeline (loops end at 2520ms, finish until 3220ms)
const t0 = Date.now()
const sleepUntil = (ms) => new Promise((r) => setTimeout(r, Math.max(0, t0 + ms - Date.now())))
await page.evaluate(() => handleBtn('D'))
await sleepUntil(200)

const overlayInfoActive = await page.evaluate(() => {
  const el = document.getElementById('wheelOverlay')
  const cs = getComputedStyle(el)
  const r = el.getBoundingClientRect()
  const ham = document.getElementById('hamster')
  return {
    classes: el.className,
    display: cs.display,
    animation: cs.animationName + ' ' + cs.animationDuration + ' ' + cs.animationTimingFunction,
    rect: { left: Math.round(r.left), top: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) },
    inlineLeftTop: el.style.left + ' / ' + el.style.top + ' / ' + el.style.width,
    imageRendering: cs.imageRendering,
    hamsterHidden: getComputedStyle(ham).visibility,
    isBusy: window.game ? game.isBusy : null
  }
})
console.log('overlay active:', JSON.stringify(overlayInfoActive, null, 2))

await page.screenshot({ path: `${OUT}/02_wheel_running_a.png` })
console.log('shot: 02_wheel_running_a (t=0.2s)')

await sleepUntil(650)
await page.screenshot({ path: `${OUT}/03_wheel_running_b.png` })
console.log('shot: 03_wheel_running_b (t=0.65s)')

await sleepUntil(1300)
await page.screenshot({ path: `${OUT}/04_wheel_running_c.png` })
console.log('shot: 04_wheel_running_c (t=1.3s)')

// finish frame window: 2520–3220ms
await sleepUntil(2700)
const finishInfo = await page.evaluate(() => {
  const el = document.getElementById('wheelOverlay')
  return { classes: el.className, bgPos: getComputedStyle(el).backgroundPosition }
})
console.log('finish state:', JSON.stringify(finishInfo))
await page.screenshot({ path: `${OUT}/05_wheel_finish_pose.png` })
console.log('shot: 05_wheel_finish_pose (t=2.7s)')

// after restore (>3220ms)
await sleepUntil(3800)
const restoredInfo = await page.evaluate(() => {
  const el = document.getElementById('wheelOverlay')
  const ham = document.getElementById('hamster')
  return {
    overlayDisplay: getComputedStyle(el).display,
    hamsterVisible: getComputedStyle(ham).visibility,
    hamsterBounce: ham.className,
    isBusy: window.game ? game.isBusy : null
  }
})
console.log('restored state:', JSON.stringify(restoredInfo, null, 2))
await page.screenshot({ path: `${OUT}/06_restored_normal.png` })
console.log('shot: 06_restored_normal (t=3.8s)')

// basic tier regression: D should NOT trigger wheel
await page.goto(`http://localhost:${PORT}/index.html?tier=basic`, { waitUntil: 'networkidle0' })
await page.evaluate(() => startGame())
await new Promise((r) => setTimeout(r, 800))
await page.evaluate(() => handleBtn('D'))
await new Promise((r) => setTimeout(r, 300))
const basicInfo = await page.evaluate(() => {
  const el = document.getElementById('wheelOverlay')
  return { isPro: window.IS_PRO, overlayDisplay: getComputedStyle(el).display, isBusy: window.game ? game.isBusy : null }
})
console.log('basic tier D press:', JSON.stringify(basicInfo))
await page.screenshot({ path: `${OUT}/07_basic_tier_d.png` })
console.log('shot: 07_basic_tier_d')

console.log('\nconsole errors:', consoleErrors.length ? consoleErrors : 'none')

await browser.close()
server.close()
console.log('done')
