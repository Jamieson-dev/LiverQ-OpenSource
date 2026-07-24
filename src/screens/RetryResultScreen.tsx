import type { RetryOutcome } from '../types'
import { AppHeader } from '../components/AppHeader'

interface RetryResultScreenProps {
  /** One outcome per question answered in the retry session. */
  outcomes: RetryOutcome[]
  /** Start another retry pass over the remaining missed questions. */
  onRetryAgain: () => void
  /** Open the missed-questions review list. */
  onReviewMissed: () => void
  onHome: () => void
}

/**
 * End-of-session summary for a "Retry Missed Questions" run. All metrics are
 * derived from this session's outcomes so the numbers are self-consistent:
 *   - mastered questions were removed from the active missed list this session
 *   - "still missed" are the retried questions that did not reach mastery
 */
export function RetryResultScreen({
  outcomes,
  onRetryAgain,
  onReviewMissed,
  onHome,
}: RetryResultScreenProps) {
  const totalRetried = outcomes.length
  const correct = outcomes.filter((o) => o.isCorrect).length
  const incorrect = totalRetried - correct
  const mastered = outcomes.filter((o) => o.mastered).length
  const stillMissed = totalRetried - mastered

  const message =
    stillMissed === 0
      ? 'All caught up'
      : mastered > 0
        ? 'Nice progress'
        : 'Keep practicing'

  return (
    <div className="screen" style={{ paddingTop: 0 }}>
      <AppHeader title="Retry Complete" />

      <div className="scroll-area">
        <div className="card" style={{ textAlign: 'center', paddingTop: 26 }}>
          <div className="section-label" style={{ margin: 0 }}>
            Retry session
          </div>
          <h2 className="h2" style={{ marginTop: 6 }}>
            {message}
          </h2>
          <div
            className="row"
            style={{ justifyContent: 'center', alignItems: 'baseline', gap: 8, marginTop: 12 }}
          >
            <span className="score-big">{correct}</span>
            <span className="muted" style={{ fontSize: 22, fontWeight: 700 }}>
              / {totalRetried}
            </span>
          </div>

          <div className="grid-2" style={{ marginTop: 16 }}>
            <Stat tint="var(--success-tint)" color="var(--success)" value={correct} label="Correct" icon="✓" />
            <Stat tint="var(--error-tint)" color="var(--error)" value={incorrect} label="Incorrect" icon="✗" />
            <Stat tint="var(--primary-tint)" color="var(--primary)" value={mastered} label="Mastered" icon="★" />
            <Stat tint="var(--surface-2)" color="var(--text)" value={stillMissed} label="Still missed" icon="●" />
          </div>
        </div>

        <div className="card">
          <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.5 }} className="muted">
            {stillMissed === 0
              ? 'You cleared every missed question in this set. New misses from future quizzes will appear here for retry.'
              : 'Answer a question correctly twice in a row to master it and remove it from your missed list.'}
          </p>
        </div>
      </div>

      <div className="sticky-actions">
        {stillMissed > 0 && (
          <button className="btn btn-primary" onClick={onRetryAgain}>
            Retry Missed Questions
          </button>
        )}
        <button className="btn btn-secondary" onClick={onReviewMissed}>
          Review Missed Questions
        </button>
        <button className="btn btn-ghost" onClick={onHome}>
          Back to Home
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
    <div style={{ background: tint, borderRadius: 'var(--r-md)', padding: '12px 8px', textAlign: 'center' }}>
      <div style={{ color, fontWeight: 800, fontSize: 22 }}>
        {icon} {value}
      </div>
      <div className="text-sm muted">{label}</div>
    </div>
  )
}
