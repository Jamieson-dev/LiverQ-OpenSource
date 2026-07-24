import type { Difficulty, Topic } from '../types'

interface ExplanationCardProps {
  /** Topic is shown ONLY after answering. */
  topic?: Topic
  explanation: string
  /** Optional metadata shown as a quiet caption (only when present). */
  subtopic?: string
  difficulty?: Difficulty
}

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: 'Easy',
  moderate: 'Moderate',
  hard: 'Hard',
}

export function ExplanationCard({
  topic,
  explanation,
  subtopic,
  difficulty,
}: ExplanationCardProps) {
  const meta = [subtopic, difficulty ? DIFFICULTY_LABEL[difficulty] : undefined]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="card">
      <div className="row" style={{ marginBottom: meta ? 4 : 10, flexWrap: 'wrap' }}>
        <span className="section-label" style={{ margin: 0 }}>
          Explanation
        </span>
        {topic && (
          <span className="tag" style={{ marginLeft: 'auto' }}>
            {topic.displayTitle}
          </span>
        )}
      </div>
      {meta && (
        <p className="text-sm muted" style={{ margin: '0 0 10px' }}>
          {meta}
        </p>
      )}
      <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>{explanation}</p>
    </div>
  )
}
