import type { WeatherData } from './weather'
import { computeBurnIndex, computeStyleIndex, type IndexResult } from './scores'
import {
  classifyHours,
  findBestGoldenWindow,
  type HourStatus,
  type TimeWindow,
} from './goldenTime'
import { buildAdvice, type Advice } from './advice'

export interface DayModel {
  /** "오늘" 또는 "내일" — 해가 진 뒤에는 내일 기준으로 판단 */
  dayLabel: string
  dateLabel: string
  isTomorrow: boolean
  /** 오늘 기준일 때만 현재 시각(시), 내일 기준이면 null */
  nowHour: number | null
  sunriseHour: number
  sunsetHour: number
  hours: {
    uv: number[]
    gusts: number[]
    wind: number[]
    humidity: number[]
  }
  burn: IndexResult
  style: IndexResult
  statuses: HourStatus[]
  goldenWindow: TimeWindow | null
  advice: Advice
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

function hourOf(iso: string): number {
  return parseInt(iso.slice(11, 13), 10)
}

export function buildDayModel(weather: WeatherData): DayModel {
  const { current, hourly, daily } = weather

  // 해가 진 뒤에 보면 오늘 판단은 의미가 없으니 내일 기준으로 전환
  const isTomorrow = current.time >= daily.sunset[0]
  const dayIdx = isTomorrow ? 1 : 0

  const offset = dayIdx * 24
  const uv = hourly.uvIndex.slice(offset, offset + 24)
  const gusts = hourly.windGusts.slice(offset, offset + 24)
  const wind = hourly.windSpeed.slice(offset, offset + 24)
  const humidity = hourly.humidity.slice(offset, offset + 24)

  const sunriseHour = hourOf(daily.sunrise[dayIdx])
  const sunsetHour = hourOf(daily.sunset[dayIdx])
  const nowHour = isTomorrow ? null : hourOf(current.time)
  const fromHour = nowHour ?? sunriseHour

  // 탄다 지수: 남은 낮 시간의 최대 UV 기준
  const burnFrom = Math.max(fromHour, sunriseHour)
  let maxUv = 0
  for (let h = burnFrom; h <= sunsetHour && h < 24; h++) {
    if (uv[h] > maxUv) maxUv = uv[h]
  }
  const burn = computeBurnIndex(maxUv)

  // 자외선 피크 구간: 최대치의 80% 이상이 이어지는 연속 구간
  let uvPeakWindow: TimeWindow | null = null
  if (maxUv >= 5) {
    const threshold = Math.max(5, maxUv * 0.8)
    let start = -1
    for (let h = sunriseHour; h <= sunsetHour && h < 24; h++) {
      if (uv[h] >= threshold) {
        if (start < 0) start = h
        uvPeakWindow = { start, end: h }
      } else if (uvPeakWindow) {
        break
      } else {
        start = -1
      }
    }
  }

  // 스타일 파괴 지수: 남은 활동 시간(해 진 뒤 3시간까지)의 최대 돌풍 기준
  const styleTo = Math.min(23, sunsetHour + 3)
  let maxGust = 0
  let gustPeakHour = fromHour
  let windSum = 0
  let windCount = 0
  for (let h = fromHour; h <= styleTo; h++) {
    if (gusts[h] > maxGust) {
      maxGust = gusts[h]
      gustPeakHour = h
    }
    windSum += wind[h]
    windCount++
  }
  const avgWind = windCount > 0 ? windSum / windCount : 0
  const style = computeStyleIndex(maxGust, avgWind, humidity[gustPeakHour] ?? 0)

  const statuses = classifyHours(uv, gusts, sunriseHour, sunsetHour)
  const goldenWindow = findBestGoldenWindow(statuses, fromHour)

  const advice = buildAdvice({
    burn,
    style,
    uvPeakWindow,
    gustPeak: maxGust > 0 ? { value: maxGust, hour: gustPeakHour } : null,
    goldenWindow,
    isTomorrow,
  })

  const date = daily.date[dayIdx]
  const d = new Date(`${date}T00:00:00Z`)
  const dateLabel = `${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일 (${WEEKDAYS[d.getUTCDay()]})`

  return {
    dayLabel: isTomorrow ? '내일' : '오늘',
    dateLabel,
    isTomorrow,
    nowHour,
    sunriseHour,
    sunsetHour,
    hours: { uv, gusts, wind, humidity },
    burn,
    style,
    statuses,
    goldenWindow,
    advice,
  }
}
