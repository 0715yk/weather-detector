export interface IndexResult {
  /** 0~100 */
  score: number
  /** 0 안심 / 1 주의 / 2 경고 / 3 위험 */
  grade: 0 | 1 | 2 | 3
  label: string
  message: string
}

interface GradeDef {
  min: number
  label: string
  message: string
}

const BURN_GRADES: GradeDef[] = [
  { min: 0, label: '안심', message: '탈 걱정 없어요' },
  { min: 21, label: '썬크림', message: '썬크림은 기본으로' },
  { min: 46, label: '양산 필수', message: '양산 없이는 탑니다' },
  { min: 71, label: '외출 자제', message: '나가면 무조건 탑니다' },
]

const STYLE_GRADES: GradeDef[] = [
  { min: 0, label: '안심', message: '머리 힘줘도 됩니다' },
  { min: 21, label: '왁스로 버팀', message: '스타일링 제품으로 버틸 만해요' },
  { min: 46, label: '모자 필수', message: '맨머리로는 스타일 유지 불가' },
  { min: 71, label: '헤어 포기', message: '머리가 남아나지 않아요' },
]

function resolveGrade(score: number, grades: GradeDef[]): IndexResult {
  let idx = 0
  for (let i = grades.length - 1; i >= 0; i--) {
    if (score >= grades[i].min) {
      idx = i
      break
    }
  }
  return {
    score,
    grade: idx as IndexResult['grade'],
    label: grades[idx].label,
    message: grades[idx].message,
  }
}

/**
 * 탄다 지수: UV 지수(0~11+)를 0~100으로 스케일링.
 * UV는 이미 구름량이 반영된 값이라 그대로 사용해도 계절 무관하게 동작한다.
 */
export function computeBurnIndex(uv: number): IndexResult {
  const score = Math.min(100, Math.round(uv * 9))
  return resolveGrade(score, BURN_GRADES)
}

/**
 * 스타일 파괴 지수: 돌풍(km/h)이 주 점수.
 * 평균 풍속은 "계속 부는지" 보정, 습도는 볼륨 붕괴/곱슬 보정.
 */
export function computeStyleIndex(
  gust: number,
  wind: number,
  humidity: number,
): IndexResult {
  let base: number
  if (gust <= 15) {
    base = (gust / 15) * 20
  } else if (gust <= 25) {
    base = 20 + ((gust - 15) / 10) * 25
  } else if (gust <= 40) {
    base = 45 + ((gust - 25) / 15) * 30
  } else {
    base = 75 + Math.min(25, ((gust - 40) / 20) * 25)
  }

  if (wind >= 20) base += 5
  if (humidity >= 90) base += 15
  else if (humidity >= 80) base += 10

  const score = Math.min(100, Math.round(base))
  return resolveGrade(score, STYLE_GRADES)
}
