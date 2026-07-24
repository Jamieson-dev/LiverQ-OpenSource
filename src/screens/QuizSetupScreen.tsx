import { useMemo, useState } from 'react'
import type { Topic } from '../types'
import { AppHeader } from '../components/AppHeader'
import { TopicSelector } from '../components/TopicSelector'
import { QuestionCountSelector } from '../components/QuestionCountSelector'
import { countApprovedQuestions } from '../lib/dataSource'

interface QuizSetupScreenProps {
  topics: Topic[]
  initialSelected: Set<string>
  initialCount: number
  onBack: () => void
  /** Persist selection back to app state when leaving. */
  onChangeSelection: (ids: Set<string>) => void
  onStart: (ids: string[], count: number) => void
}

export function QuizSetupScreen({
  topics,
  initialSelected,
  initialCount,
  onBack,
  onChangeSelection,
  onStart,
}: QuizSetupScreenProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initialSelected))
  const [count, setCount] = useState<number>(initialCount)

  const selectableIds = useMemo(
    () => topics.filter((t) => t.enabled && t.approvedQuestionCount > 0).map((t) => t.id),
    [topics]
  )

  const selectedIds = useMemo(() => Array.from(selected), [selected])
  const available = useMemo(
    () => countApprovedQuestions(selectedIds),
    [selectedIds]
  )

  function update(next: Set<string>) {
    setSelected(next)
    onChangeSelection(next)
  }

  function toggle(id: string) {
    const next = new Set(selected)
    next.has(id) ? next.delete(id) : next.add(id)
    update(next)
  }

  function selectAll() {
    update(new Set(selectableIds))
  }

  function clearAll() {
    update(new Set())
  }

  const effectiveCount = Math.min(count, available)
  const canStart = selected.size > 0 && available > 0

  return (
    <div className="screen screen-setup" style={{ paddingTop: 0 }}>
      <AppHeader title="Choose Topics" onBack={onBack} />

      <div className="scroll-area">
        {/* Global quiz setting — near the top but scrolls naturally with the
            page (no longer pinned), so the topic list gets more room. */}
        <div className="section-label" style={{ margin: 0 }}>
          Questions per quiz
        </div>
        <QuestionCountSelector
          value={count}
          onChange={setCount}
          available={available}
        />

        <TopicSelector
          topics={topics}
          selectedIds={selected}
          onToggle={toggle}
          onSelectAll={selectAll}
          onClearAll={clearAll}
        />
      </div>

      {/* Easily reachable bottom action */}
      <div className="sticky-actions">
        {!canStart && selected.size > 0 && (
          <p className="text-sm" style={{ color: 'var(--warning)', margin: 0, textAlign: 'center' }}>
            Selected topics have no questions available yet.
          </p>
        )}
        <button
          className="btn btn-primary"
          disabled={!canStart}
          onClick={() => onStart(selectedIds, effectiveCount)}
        >
          {canStart
            ? `Start Quiz (${effectiveCount})`
            : 'Select at least one topic'}
        </button>
      </div>
    </div>
  )
}
