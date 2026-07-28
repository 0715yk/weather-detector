export interface GeoResult {
  id: number
  name: string
  latitude: number
  longitude: number
  /** 시/도 단위 상위 행정구역 (예: "서울특별시") */
  admin1?: string
  country?: string
  country_code?: string
}

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'

export async function searchLocations(query: string): Promise<GeoResult[]> {
  const trimmed = query.trim()
  if (!trimmed) return []

  const params = new URLSearchParams({
    name: trimmed,
    count: '8',
    language: 'ko',
    format: 'json',
  })

  const res = await fetch(`${GEOCODING_URL}?${params}`)
  if (!res.ok) {
    throw new Error(`지역 검색에 실패했어요 (${res.status})`)
  }
  const json = await res.json()
  return (json.results ?? []) as GeoResult[]
}
