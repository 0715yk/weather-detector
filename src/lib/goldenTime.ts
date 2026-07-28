export type HourStatus = 'night' | 'golden' | 'caution' | 'bad'

export interface TimeWindow {
  /** 시작 시(포함) */
  start: number
  /** 종료 시(포함) */
  end: number
}

/**
 * 하루 24시간을 골든/주의/나쁨/밤으로 분류.
 * 골든: 자외선 낮고(≤3) 돌풍 약함(≤20km/h) — 나가기 좋은 시간
 */
export function classifyHours(
  uv: number[],
  gusts: number[],
  sunriseHour: number,
  sunsetHour: number,
): HourStatus[] {
  return uv.map((u, h) => {
    if (h < sunriseHour || h > sunsetHour) return 'night'
    const g = gusts[h]
    if (u <= 3 && g <= 20) return 'golden'
    if (u <= 6 && g <= 32) return 'caution'
    return 'bad'
  })
}

/**
 * fromHour 이후의 골든 구간 중 가장 긴 연속 구간을 반환.
 * 같은 길이면 더 이른 구간 우선.
 */
export function findBestGoldenWindow(
  statuses: HourStatus[],
  fromHour: number,
): TimeWindow | null {
  let best: TimeWindow | null = null
  let runStart = -1

  const closeRun = (endHour: number) => {
    if (runStart < 0) return
    const candidate = { start: runStart, end: endHour }
    const len = candidate.end - candidate.start
    if (!best || len > best.end - best.start) best = candidate
    runStart = -1
  }

  for (let h = Math.max(0, fromHour); h < statuses.length; h++) {
    if (statuses[h] === 'golden') {
      if (runStart < 0) runStart = h
    } else {
      closeRun(h - 1)
    }
  }
  closeRun(statuses.length - 1)

  return best
}
