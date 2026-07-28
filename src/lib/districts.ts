// 전국 읍면동 중심 좌표 내장 데이터 검색.
// 데이터 재생성: node scripts/build-districts.mjs
import raw from '../data/districts.json'

export interface DistrictResult {
  /** 읍면동 이름 (예: "판교동") */
  name: string
  /** 상위 행정구역 (예: "경기도 성남시분당구") */
  admin: string
  lat: number
  lon: number
}

type Row = [name: string, lat: number, lon: number]
const rows = raw as Row[]

/**
 * 한국 행정동 검색.
 * 우선순위: 읍면동 정확 일치 > 읍면동 시작 일치 > 시군구/시도 시작 일치 > 전체 문자열 포함
 */
export function searchDistricts(query: string, limit = 8): DistrictResult[] {
  const q = query.trim().replace(/\s+/g, '')
  if (!q) return []

  const scored: { rank: number; result: DistrictResult }[] = []
  for (const [full, lat, lon] of rows) {
    const parts = full.split(' ')
    const last = parts[parts.length - 1]

    let rank = -1
    if (last === q) rank = 0
    else if (last.startsWith(q)) rank = 1
    else if (parts.some((p) => p.startsWith(q))) rank = 2
    else if (full.replace(/\s+/g, '').includes(q)) rank = 3

    if (rank >= 0) {
      scored.push({
        rank,
        result: { name: last, admin: parts.slice(0, -1).join(' '), lat, lon },
      })
    }
  }

  scored.sort(
    (a, b) => a.rank - b.rank || a.result.name.length - b.result.name.length,
  )
  return scored.slice(0, limit).map((s) => s.result)
}
