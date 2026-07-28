import { formatWindow } from '../lib/advice'
import type { HourStatus, TimeWindow } from '../lib/goldenTime'

interface Props {
  statuses: HourStatus[]
  nowHour: number | null
  goldenWindow: TimeWindow | null
}

const STATUS_LABEL: Record<HourStatus, string> = {
  night: '밤',
  golden: '골든타임',
  caution: '보통',
  bad: '위험',
}

export default function Timeline({ statuses, nowHour, goldenWindow }: Props) {
  return (
    <section className="card timeline">
      <div className="card-header">
        <h2 className="card-title">골든타임</h2>
        <span className="card-caption">
          {goldenWindow
            ? `${formatWindow(goldenWindow)}에 나가는 게 최선`
            : '나가기 좋은 구간 없음'}
        </span>
      </div>
      <div className="timeline-bar" role="img" aria-label="24시간 외출 적합도 타임라인">
        {statuses.map((status, h) => (
          <div
            key={h}
            className={`timeline-cell status-${status}${h === nowHour ? ' is-now' : ''}`}
            title={`${h}시 — ${STATUS_LABEL[status]}`}
          />
        ))}
      </div>
      <div className="timeline-hours">
        <span>0시</span>
        <span>6시</span>
        <span>12시</span>
        <span>18시</span>
        <span>24시</span>
      </div>
      <div className="timeline-legend">
        <span className="legend-item">
          <i className="legend-dot status-golden" /> 나가기 좋음
        </span>
        <span className="legend-item">
          <i className="legend-dot status-caution" /> 보통
        </span>
        <span className="legend-item">
          <i className="legend-dot status-bad" /> 위험
        </span>
        <span className="legend-item">
          <i className="legend-dot status-night" /> 밤
        </span>
      </div>
    </section>
  )
}
