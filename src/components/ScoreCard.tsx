import type { IndexResult } from '../lib/scores'

interface Props {
  title: string
  emoji: string
  result: IndexResult
  sub: string
}

export default function ScoreCard({ title, emoji, result, sub }: Props) {
  return (
    <section className={`score-card grade-${result.grade}`}>
      <h2 className="score-card-title">
        <span aria-hidden>{emoji}</span> {title}
      </h2>
      <div className="score-value">
        {result.score}
        <span className="score-max">/100</span>
      </div>
      <div className="score-label">{result.label}</div>
      <p className="score-message">{result.message}</p>
      <div className="score-sub">{sub}</div>
    </section>
  )
}
