import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchWeather, type WeatherData } from './lib/weather'
import { buildDayModel } from './lib/day'
import ScoreCard from './components/ScoreCard'
import AdviceBanner from './components/AdviceBanner'
import Timeline from './components/Timeline'
import HourlyDetail from './components/HourlyDetail'
import LocationPicker, { type PickedLocation } from './components/LocationPicker'

const STORAGE_KEY = 'nagalkka:location'
const DEFAULT_LOCATION: PickedLocation = { name: '서울', lat: 37.5665, lon: 126.978 }

function loadSavedLocation(): PickedLocation | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as PickedLocation) : null
  } catch {
    return null
  }
}

export default function App() {
  const [location, setLocation] = useState<PickedLocation | null>(loadSavedLocation)
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)

  const selectLocation = useCallback((loc: PickedLocation) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(loc))
    } catch {
      // 저장 실패해도 이번 세션에서는 동작
    }
    setLocation(loc)
    setPickerOpen(false)
  }, [])

  // 저장된 위치가 없으면 현재 위치를 시도하고, 실패하면 서울로
  useEffect(() => {
    if (location) return
    if (!('geolocation' in navigator)) {
      setLocation(DEFAULT_LOCATION)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        selectLocation({
          name: '현재 위치',
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        }),
      () => setLocation(DEFAULT_LOCATION),
      { timeout: 8000, maximumAge: 10 * 60 * 1000 },
    )
  }, [location, selectLocation])

  useEffect(() => {
    if (!location) return
    let cancelled = false
    setError(null)
    setWeather(null)
    fetchWeather(location.lat, location.lon)
      .then((data) => {
        if (!cancelled) setWeather(data)
      })
      .catch((e: unknown) => {
        if (!cancelled)
          setError(e instanceof Error ? e.message : '날씨 데이터를 불러오지 못했어요')
      })
    return () => {
      cancelled = true
    }
  }, [location])

  const model = useMemo(() => (weather ? buildDayModel(weather) : null), [weather])

  return (
    <div className="app">
      <header className="app-header">
        <button className="location-button" onClick={() => setPickerOpen(true)}>
          <span className="location-name">{location?.name ?? '위치 확인 중'}</span>
          <span className="location-caret" aria-hidden>
            ▾
          </span>
        </button>
        {model && weather && (
          <div className="header-meta">
            <span className="header-day">
              {model.dayLabel} · {model.dateLabel}
            </span>
            <span className="header-temp">{Math.round(weather.current.temperature)}°</span>
          </div>
        )}
      </header>

      {error && (
        <div className="state-box">
          <p>{error}</p>
          <button
            className="retry-button"
            onClick={() => location && setLocation({ ...location })}
          >
            다시 시도
          </button>
        </div>
      )}

      {!error && !model && <div className="state-box">날씨를 불러오는 중...</div>}

      {model && (
        <main className="app-main">
          <AdviceBanner advice={model.advice} />

          <div className="score-grid">
            <ScoreCard
              title="탄다 지수"
              emoji="☀️"
              result={model.burn}
              sub={`${model.dayLabel} 최대 UV ${Math.round(
                Math.max(...model.hours.uv) * 10,
              ) / 10}`}
            />
            <ScoreCard
              title="스타일 파괴"
              emoji="💇"
              result={model.style}
              sub={`최대 돌풍 ${Math.round(Math.max(...model.hours.gusts))}km/h`}
            />
          </div>

          <Timeline
            statuses={model.statuses}
            nowHour={model.nowHour}
            goldenWindow={model.goldenWindow}
          />

          <HourlyDetail
            uv={model.hours.uv}
            gusts={model.hours.gusts}
            nowHour={model.nowHour}
          />

          {model.isTomorrow && (
            <p className="footnote">해가 진 뒤라서 내일 기준으로 보여드려요</p>
          )}
        </main>
      )}

      <LocationPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={selectLocation}
      />
    </div>
  )
}
