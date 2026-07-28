import type { Advice } from '../lib/advice'

interface Props {
  advice: Advice
}

export default function AdviceBanner({ advice }: Props) {
  return (
    <section className="advice-banner">
      <p className="advice-headline">{advice.headline}</p>
      <p className="advice-sub">{advice.sub}</p>
      <ul className="advice-items">
        {advice.items.map((item) => (
          <li key={item.label} className="advice-item">
            <span aria-hidden>{item.emoji}</span> {item.label}
          </li>
        ))}
      </ul>
    </section>
  )
}
