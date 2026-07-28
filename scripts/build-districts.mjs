// 전국 행정동(읍면동) 중심 좌표 데이터를 생성한다.
// 원본: https://github.com/vuski/admdongkor (통계청/행안부 행정동 경계, 자유 이용)
// 실행: node scripts/build-districts.mjs
import { writeFile } from 'node:fs/promises'

const VERSION = 'ver20260701'
const DATA_URL = `https://raw.githubusercontent.com/vuski/admdongkor/master/${VERSION}/HangJeongDong_${VERSION}.geojson`

console.log(`downloading ${DATA_URL} ...`)
const res = await fetch(DATA_URL)
if (!res.ok) throw new Error(`download failed: ${res.status}`)
const geojson = await res.json()

/** 폴리곤 꼭짓점 평균으로 중심 좌표 근사 (날씨 조회 용도로는 충분) */
function centroidOf(geometry) {
  // MultiPolygon: 가장 큰 폴리곤의 외곽 링 사용
  let ring
  if (geometry.type === 'MultiPolygon') {
    let best = geometry.coordinates[0]
    for (const poly of geometry.coordinates) {
      if (poly[0].length > best[0].length) best = poly
    }
    ring = best[0]
  } else {
    ring = geometry.coordinates[0]
  }
  let lonSum = 0
  let latSum = 0
  for (const [lon, lat] of ring) {
    lonSum += lon
    latSum += lat
  }
  const n = ring.length
  return [
    Math.round((latSum / n) * 10000) / 10000,
    Math.round((lonSum / n) * 10000) / 10000,
  ]
}

const rows = []
for (const feature of geojson.features) {
  const name = feature.properties.adm_nm // 예: "서울특별시 종로구 사직동"
  if (!name || !feature.geometry) continue
  const [lat, lon] = centroidOf(feature.geometry)
  rows.push([name, lat, lon])
}

rows.sort((a, b) => a[0].localeCompare(b[0], 'ko'))

const out = new URL('../src/data/districts.json', import.meta.url)
await writeFile(out, JSON.stringify(rows))
console.log(`generated src/data/districts.json (${rows.length} districts)`)
