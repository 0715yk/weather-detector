import type { IndexResult } from './scores'
import type { TimeWindow } from './goldenTime'

export interface AdviceItem {
  emoji: string
  label: string
}

export interface Advice {
  headline: string
  sub: string
  items: AdviceItem[]
}

export interface AdviceInput {
  burn: IndexResult
  style: IndexResult
  /** 자외선 피크 구간 (피크가 낮으면 null) */
  uvPeakWindow: TimeWindow | null
  gustPeak: { value: number; hour: number } | null
  goldenWindow: TimeWindow | null
  isTomorrow: boolean
}

export function formatWindow(w: TimeWindow): string {
  if (w.start === w.end) return `${w.start}시`
  return `${w.start}시~${w.end}시`
}

export function buildAdvice(input: AdviceInput): Advice {
  const { burn, style, uvPeakWindow, gustPeak, goldenWindow, isTomorrow } = input
  const day = isTomorrow ? '내일' : '오늘'
  const gust = gustPeak ? Math.round(gustPeak.value) : 0

  let headline: string
  if (burn.grade >= 3 && style.grade >= 3) {
    headline = `${day}은 자외선도 바람도 최악이에요. 웬만하면 나가지 마세요.`
  } else if (burn.grade >= 3) {
    headline = uvPeakWindow
      ? `${day}은 나가면 무조건 탑니다. ${formatWindow(uvPeakWindow)}는 특히 피하고, 나가야 하면 양산 필수예요.`
      : `${day}은 나가면 무조건 탑니다. 나가야 하면 양산 필수예요.`
  } else if (style.grade >= 3) {
    headline = `머리가 남아나지 않는 바람이에요 (돌풍 ${gust}km/h). 모자 없인 포기하세요.`
  } else if (burn.grade >= 2 && style.grade >= 2) {
    headline = `${day}은 자외선도 바람도 강해요. 양산과 모자 둘 다 챙기세요.`
  } else if (burn.grade >= 2) {
    headline = uvPeakWindow
      ? `양산 없이 나가면 탑니다. ${formatWindow(uvPeakWindow)} 자외선 피크예요.`
      : `양산 없이 나가면 탑니다.`
  } else if (style.grade >= 2) {
    headline = gustPeak
      ? `${gustPeak.hour}시쯤 돌풍 ${gust}km/h까지 붑니다. 모자 챙기세요.`
      : `머리 날리는 바람이 붑니다. 모자 챙기세요.`
  } else if (burn.grade === 1 && style.grade === 1) {
    headline = `${day}은 무난해요. 썬크림 바르고, 머리는 가볍게 고정하세요.`
  } else if (burn.grade === 1) {
    headline = `${day}은 무난한 날이에요. 썬크림만 바르고 나가세요.`
  } else if (style.grade === 1) {
    headline = `바람이 조금 있지만 버틸 만해요. 왁스면 충분합니다.`
  } else {
    headline = `${day}은 부담 없이 나가도 되는 날이에요. 머리 힘줘도 됩니다.`
  }

  const sub = goldenWindow
    ? `나가기 좋은 시간: ${formatWindow(goldenWindow)}`
    : `${day}은 나가기 좋은 시간대가 없어요.`

  const items: AdviceItem[] = []
  if (burn.grade >= 1) items.push({ emoji: '🧴', label: '썬크림' })
  if (burn.grade >= 2) items.push({ emoji: '⛱️', label: '양산' })
  if (style.grade >= 2) items.push({ emoji: '🧢', label: '모자' })
  if (burn.grade >= 3) items.push({ emoji: '🏠', label: '되도록 실내' })
  if (items.length === 0) items.push({ emoji: '👍', label: '빈손 외출 가능' })

  return { headline, sub, items }
}
