// Generate PNG icons (PWA + apple-touch-icon) from scripts/icon.svg.

import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const root = resolve(__dirname, '..')
const svgPath = resolve(__dirname, 'icon.svg')
const outDir = resolve(root, 'public')

mkdirSync(outDir, { recursive: true })
const svg = readFileSync(svgPath)

const targets = [
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'icon-maskable-512.png', size: 512 }, // same source; safe area baked into svg margin
]

for (const t of targets) {
  const out = resolve(outDir, t.name)
  await sharp(svg).resize(t.size, t.size).png().toFile(out)
  console.log(`✓ ${t.name} (${t.size}×${t.size})`)
}

// Copy SVG as favicon.svg (overwrites scaffold default)
writeFileSync(resolve(outDir, 'favicon.svg'), svg)
console.log('✓ favicon.svg')
