import type { Topic } from '../types'
import { TOPIC_COUNTS } from './topicCounts'

// ============================================================
// LiverQ (open source) — topic list.
//
// These are GENERAL, independently named topics used only to organize the
// small demonstration question set. They are not tied to any specific
// clinical guideline. `approvedQuestionCount` comes from the precomputed
// TOPIC_COUNTS map so the topic list renders without loading question
// content; dataSource.ts reconciles the two once the bank lazy-loads
// (dev-only warning on drift).
// ============================================================

interface TopicDef {
  /** Canonical id — also used as the slug. */
  id: string
  /** General topic title shown in the UI. */
  title: string
  enabled?: boolean
}

const TOPIC_DEFS: TopicDef[] = [
  { id: 'liver-basics', title: 'Liver Basics' },
  { id: 'viral-hepatitis-basics', title: 'Viral Hepatitis Basics' },
  { id: 'cirrhosis-and-complications', title: 'Cirrhosis and Complications' },
  { id: 'liver-tests-and-imaging', title: 'Liver Tests and Imaging' },
]

export const TOPICS: Topic[] = TOPIC_DEFS.map((def) => ({
  id: def.id,
  officialTitle: def.title,
  displayTitle: def.title,
  slug: def.id,
  enabled: def.enabled ?? true,
  approvedQuestionCount: TOPIC_COUNTS[def.id] ?? 0,
}))
