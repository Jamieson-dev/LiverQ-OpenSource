import type { AnsweredItem, Topic } from '../types'
import { AppHeader } from '../components/AppHeader'

interface ResultScreenProps {
  answers: AnsweredItem[]
  topicsIncluded: Topic[]
  onReviewIncorrect: () => void
  onRestart: () => void
  onHome: () => void
}

export function ResultScreen({
  answers,
  topicsIncluded,
  onReviewIncorrect,
  onRestart,
  onHome,
}: ResultScreenProps) {
  const total = answers.length
  const correct = answers.filter((a) => a.isCorrect).length
  const incorrect = total - correct
  const pct = total ? Math.round((correct / total) * 100) : 0

  const message =
    pct >= 80 ? 'Strong result' : pct >= 50 ? 'Good progress' : 'Keep practicing'

  return (
    <div className="screen" style={{ paddingTop: 0 }}>
      <AppHeader title="Results" />

      <div className="scroll-area">
        {/* Score card */}
        <div className="card" style={{ textAlign: 'center', paddingTop: 26 }}>
          <div className="section-label" style={{ margin: 0 }}>
            Quiz complete
          </div>
          <h2 className="h2" style={{ marginTop: 6 }}>
            {message}
          </h2>
          <div className="row" style={{ justifyContent: 'center', alignItems: 'baseline', gap: 8, marginTop: 12 }}>
            <span className="score-big">{correct}</span>
            <span className="muted" style={{ fontSize: 22, fontWeight: 700 }}>
              / {total}
            </span>
            <span style={{ color: 'var(--success)', fontWeight: 800, fontSize: 18, marginLeft: 6 }}>
              {pct}%
            </span>
          </div>

          {/* tri-stat */}
          <div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr', marginTop: 16 }}>
            <Stat tint="var(--success-tint)" color="var(--success)" value={correct} label="Correct" icon="✓" />
            <Stat tint="var(--error-tint)" color="var(--error)" value={incorrect} label="Incorrect" icon="✗" />
          </div>
        </div>

        {/* Topics included */}
        <div className="card">
          <div className="section-label" style={{ margin: '0 0 8px' }}>
            Topics included
          </div>
          <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
            {topicsIncluded.map((t) => (
              <span key={t.id} className="tag">
                {t.displayTitle}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="sticky-actions">
        {incorrect > 0 && (
          <button className="btn btn-secondary" onClick={onReviewIncorrect}>
            Review incorrect answers
          </button>
        )}
        <button className="btn btn-primary" onClick={onRestart}>
          Restart quiz
        </button>
        <button className="btn btn-ghost" onClick={onHome}>
          Back home
        </button>
      </div>
    </div>
  )
}

function Stat({
  tint,
  color,
  value,
  label,
  icon,
}: {
  tint: string
  color: string
  value: number
  label: string
  icon: string
}) {
  return (
    <div style={{ background: tint, borderRadius: 'var(--r-md)', padding: '12px 8px' }}>
      <div style={{ color, fontWeight: 800, fontSize: 22 }}>
        {icon} {value}
      </div>
      <div className="text-sm muted">{label}</div>
    </div>
  )
}
