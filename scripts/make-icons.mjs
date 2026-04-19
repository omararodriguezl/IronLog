// Script to generate PNG icons from SVG
// Run: node scripts/make-icons.mjs
// Requires: npm install sharp

import { createCanvas } from 'canvas'
import { writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function drawIcon(size) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  // Background
  ctx.fillStyle = '#0d1117'
  roundRect(ctx, 0, 0, size, size, size * 0.15)
  ctx.fill()

  const s = size / 512

  // Dumbbell
  ctx.fillStyle = '#39d353'

  // Left big plate
  roundRect(ctx, 40*s, 210*s, 60*s, 92*s, 10*s)
  ctx.fill()

  // Left small plate
  roundRect(ctx, 90*s, 230*s, 28*s, 52*s, 6*s)
  ctx.fill()

  // Bar
  roundRect(ctx, 118*s, 242*s, 276*s, 28*s, 8*s)
  ctx.fill()

  // Right small plate
  roundRect(ctx, 394*s, 230*s, 28*s, 52*s, 6*s)
  ctx.fill()

  // Right big plate
  roundRect(ctx, 412*s, 210*s, 60*s, 92*s, 10*s)
  ctx.fill()

  // Lightning bolt cutout
  ctx.fillStyle = '#0d1117'
  ctx.globalAlpha = 0.9
  ctx.beginPath()
  ctx.moveTo(280*s, 130*s)
  ctx.lineTo(220*s, 265*s)
  ctx.lineTo(265*s, 265*s)
  ctx.lineTo(235*s, 385*s)
  ctx.lineTo(345*s, 230*s)
  ctx.lineTo(295*s, 230*s)
  ctx.lineTo(330*s, 130*s)
  ctx.closePath()
  ctx.fill()
  ctx.globalAlpha = 1

  return canvas.toBuffer('image/png')
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

writeFileSync(path.join(__dirname, '../public/icons/icon-192.png'), drawIcon(192))
writeFileSync(path.join(__dirname, '../public/icons/icon-512.png'), drawIcon(512))
console.log('Icons generated!')
