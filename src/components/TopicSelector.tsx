import type { Topic } from '../types'
import { TopicCheckboxItem } from './TopicCheckboxItem'

interface TopicSelectorProps {
  topics: Topic[]
  selectedIds: Set<string>
  onToggle: (id: string) => void
  onSelectAll: () => void
  onClearAll: () => void
}

export function TopicSelector({
  topics,
  selectedIds,
  onToggle,
  onSelectAll,
  onClearAll,
}: TopicSelectorProps) {
  return (
    <div className="stack">
      {/* Select all / clear all + count */}
      <div className="row between">
        <div className="row" style={{ gap: 8 }}>
          <button className="chip" onClick={onSelectAll}>
            Select all
          </button>
          <button className="chip" onClick={onClearAll}>
            Clear all
          </button>
        </div>
        <span className="text-sm" style={{ fontWeight: 700 }}>
          {selectedIds.size} topic{selectedIds.size === 1 ? '' : 's'} selected
        </span>
      </div>

      {/* Topic list (all 24 topics; search intentionally omitted) */}
      <div className="stack-sm">
        {topics.map((topic) => (
          <TopicCheckboxItem
            key={topic.id}
            topic={topic}
            checked={selectedIds.has(topic.id)}
            onToggle={() => onToggle(topic.id)}
          />
        ))}
      </div>
    </div>
  )
}
