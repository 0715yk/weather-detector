interface Props {
  uv: number[]
  gusts: number[]
  nowHour: number | null
}

function uvColorClass(uv: number): string {
  if (uv <= 2) return 'bar-safe'
  if (uv <= 5) return 'bar-mild'
  if (uv <= 7) return 'bar-warn'
  return 'bar-danger'
}

function gustColorClass(gust: number): string {
  if (gust <= 15) return 'bar-safe'
  if (gust <= 25) return 'bar-mild'
  if (gust <= 40) return 'bar-warn'
  return 'bar-danger'
}

interface ChartProps {
  title: string
  unit: string
  values: number[]
  maxScale: number
  colorClass: (v: number) => string
  nowHour: number | null
}

function BarChart({ title, unit, values, maxScale, colorClass, nowHour }: ChartProps) {
  return (
    <div className="chart">
      <div className="chart-header">
        <span className="chart-title">{title}</span>
        <span className="chart-unit">{unit}</span>
      </div>
      <div className="chart-bars">
        {values.map((v, h) => {
          const heightPct = Math.max(4, Math.min(100, (v / maxScale) * 100))
          return (
            <div
              key={h}
              className={`chart-col${h === nowHour ? ' is-now' : ''}`}
              title={`${h}시 — ${Math.round(v * 10) / 10}${unit}`}
            >
              <div
                className={`chart-bar ${colorClass(v)}`}
                style={{ height: `${heightPct}%` }}
              />
              <span className="chart-hour">{h % 3 === 0 ? h : ''}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function HourlyDetail({ uv, gusts, nowHour }: Props) {
  const gustScale = Math.max(40, ...gusts)
  return (
    <section className="card hourly-detail">
      <div className="card-header">
        <h2 className="card-title">시간별 상세</h2>
      </div>
      <BarChart
        title="자외선"
        unit="UV"
        values={uv}
        maxScale={11}
        colorClass={uvColorClass}
        nowHour={nowHour}
      />
      <BarChart
        title="돌풍"
        unit="km/h"
        values={gusts}
        maxScale={gustScale}
        colorClass={gustColorClass}
        nowHour={nowHour}
      />
    </section>
  )
}
