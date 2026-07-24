import type { Topic } from '../types'

interface TopicCheckboxItemProps {
  topic: Topic
  checked: boolean
  onToggle: () => void
}

export function TopicCheckboxItem({
  topic,
  checked,
  onToggle,
}: TopicCheckboxItemProps) {
  const disabled = !topic.enabled || topic.approvedQuestionCount === 0
  const count = topic.approvedQuestionCount

  return (
    <button
      type="button"
      className={`topic-item ${checked ? 'is-selected' : ''} ${
        disabled ? 'is-disabled' : ''
      }`}
      onClick={disabled ? undefined : onToggle}
      disabled={disabled}
      aria-pressed={checked}
    >
      <span className="box">{checked ? '✓' : ''}</span>
      {/* Full topic title — wraps naturally into 2–3 lines. */}
      <span className="topic-title">{topic.displayTitle}</span>
      {/* Compact inline count, right-aligned and visually secondary. */}
      <span className={`topic-meta ${count === 0 ? 'is-empty' : ''}`}>
        {count === 0 ? 'none yet' : `${count} q`}
      </span>
    </button>
  )
}
