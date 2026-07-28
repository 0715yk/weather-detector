import { useEffect, useRef, useState } from 'react'
import { searchLocations } from '../lib/geocoding'
import { searchDistricts } from '../lib/districts'

export interface PickedLocation {
  name: string
  lat: number
  lon: number
}

interface SearchItem {
  key: string
  name: string
  admin: string
  lat: number
  lon: number
}

interface Props {
  open: boolean
  onClose: () => void
  onSelect: (loc: PickedLocation) => void
}

export default function LocationPicker({ open, onClose, onSelect }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchItem[]>([])
  const [searching, setSearching] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      setResults([])
      setMessage(null)
      // 시트 열림 애니메이션 후 포커스
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setMessage(null)
      return
    }
    setSearching(true)
    setMessage(null)
    const timer = setTimeout(async () => {
      // 1순위: 내장된 전국 읍면동 데이터 (판교동 같은 동 단위까지 정확)
      const local: SearchItem[] = searchDistricts(query).map((d) => ({
        key: `d:${d.admin} ${d.name}`,
        name: d.name,
        admin: d.admin,
        lat: d.lat,
        lon: d.lon,
      }))

      if (local.length >= 3) {
        setResults(local)
        setSearching(false)
        return
      }

      // 국내 결과가 부족하면 Open-Meteo 지오코딩으로 보완 (해외 지명 등)
      try {
        const remote = await searchLocations(query)
        const sorted = [...remote].sort(
          (a, b) =>
            (a.country_code === 'KR' ? 0 : 1) - (b.country_code === 'KR' ? 0 : 1),
        )
        const remoteItems: SearchItem[] = sorted.map((r) => ({
          key: `g:${r.id}`,
          name: r.name,
          admin: [r.admin1, r.country].filter(Boolean).join(' · '),
          lat: r.latitude,
          lon: r.longitude,
        }))
        const combined = [...local, ...remoteItems]
        setResults(combined)
        setMessage(combined.length === 0 ? '검색 결과가 없어요' : null)
      } catch {
        setResults(local)
        setMessage(local.length === 0 ? '검색에 실패했어요. 다시 시도해주세요' : null)
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const useCurrentLocation = () => {
    if (!('geolocation' in navigator)) {
      setMessage('이 기기에서 위치를 사용할 수 없어요')
      return
    }
    setMessage('현재 위치 확인 중...')
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        onSelect({
          name: '현재 위치',
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        }),
      () => setMessage('위치 권한이 거부됐어요. 지역명으로 검색해주세요'),
      { timeout: 8000, maximumAge: 10 * 60 * 1000 },
    )
  }

  if (!open) return null

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-handle" />
        <h2 className="sheet-title">위치 설정</h2>
        <input
          ref={inputRef}
          className="sheet-input"
          type="search"
          placeholder="지역명 검색 (예: 강남, 부산)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="sheet-gps" onClick={useCurrentLocation}>
          📍 현재 위치 사용
        </button>
        {message && <p className="sheet-message">{message}</p>}
        {searching && !message && <p className="sheet-message">검색 중...</p>}
        <ul className="sheet-results">
          {results.map((r) => (
            <li key={r.key}>
              <button
                className="sheet-result"
                onClick={() => onSelect({ name: r.name, lat: r.lat, lon: r.lon })}
              >
                <span className="result-name">{r.name}</span>
                <span className="result-admin">{r.admin}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
