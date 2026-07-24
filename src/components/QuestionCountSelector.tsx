import { QUESTION_COUNT_OPTIONS } from '../lib/quiz'

interface QuestionCountSelectorProps {
  value: number
  onChange: (value: number) => void
  /** Total approved questions available for the current selection. */
  available: number
}

export function QuestionCountSelector({
  value,
  onChange,
  available,
}: QuestionCountSelectorProps) {
  return (
    <div>
      {/* Refined segmented control */}
      <div className="segmented" role="group" aria-label="Questions per quiz">
        {QUESTION_COUNT_OPTIONS.map((opt) => {
          const tooMany = opt > available
          return (
            <button
              key={opt}
              className={value === opt ? 'is-active' : ''}
              onClick={() => onChange(opt)}
              disabled={available === 0}
              aria-pressed={value === opt}
              title={
                tooMany
                  ? `Only ${available} available — quiz will use ${available}`
                  : undefined
              }
            >
              {opt}
            </button>
          )
        })}
      </div>
      {available > 0 && value > available && (
        <p
          className="text-sm"
          style={{ color: 'var(--warning)', margin: 'var(--s2) 2px 0' }}
        >
          Only {available} question{available === 1 ? '' : 's'} are available for
          your selected topics.
        </p>
      )}
    </div>
  )
}
