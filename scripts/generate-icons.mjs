// public/icon.svg에서 PWA용 PNG 아이콘들을 생성한다.
// 실행: node scripts/generate-icons.mjs
import sharp from 'sharp'
import { readFile } from 'node:fs/promises'

const svg = await readFile(new URL('../public/icon.svg', import.meta.url))

const targets = [
  { file: 'public/pwa-192x192.png', size: 192, padding: 0 },
  { file: 'public/pwa-512x512.png', size: 512, padding: 0 },
  // maskable: 안전 영역 확보를 위해 배경 위에 80% 크기로 배치
  { file: 'public/pwa-maskable-512x512.png', size: 512, padding: 52 },
  { file: 'public/apple-touch-icon.png', size: 180, padding: 0 },
]

for (const { file, size, padding } of targets) {
  const inner = size - padding * 2
  const icon = await sharp(svg).resize(inner, inner).png().toBuffer()
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: '#0b0e1a',
    },
  })
    .composite([{ input: icon, top: padding, left: padding }])
    .png()
    .toFile(file)
  console.log(`generated ${file}`)
}
