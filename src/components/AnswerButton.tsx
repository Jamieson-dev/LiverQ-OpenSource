interface AnswerButtonProps {
  index: number
  label: string
  selected: boolean
  /** Once answered, we reveal correctness state. */
  answered: boolean
  isCorrectAnswer: boolean
  onSelect: () => void
}

const KEYS = ['A', 'B', 'C', 'D', 'E', 'F']

export function AnswerButton({
  index,
  label,
  selected,
  answered,
  isCorrectAnswer,
  onSelect,
}: AnswerButtonProps) {
  // State classes only apply AFTER answering (topic/answer stays hidden before).
  let stateClass = ''
  let mark = ''
  if (answered) {
    if (isCorrectAnswer) {
      stateClass = 'is-correct'
      mark = '✓'
    } else if (selected) {
      stateClass = 'is-wrong'
      mark = '✗'
    }
  } else if (selected) {
    stateClass = 'is-selected'
  }

  return (
    <button
      className={`answer ${stateClass}`}
      onClick={onSelect}
      disabled={answered}
      aria-pressed={selected}
    >
      <span className="key">{KEYS[index] ?? index + 1}</span>
      <span>{label}</span>
      {mark && <span className="mark">{mark}</span>}
    </button>
  )
}
