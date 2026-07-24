// ============================================================
// LiverQ — on-device study stats (pure derivation, no storage/DOM).
//
// Everything here is computed from data the app ALREADY records:
//   - saved answers (questionId -> latest answer, with isCorrect)
//   - the approved question bank (questionId -> topicId)
//   - topic titles + total approved counts
// No new tracking is introduced and no fake numbers are invented.
// ============================================================

import type { Question, StoredAnswer, Topic } from '../types'

/** Performance band used for color coding. */
export type PerfBand = 'strong' | 'ok' | 'weak' | 'none'

/** Map an accuracy (0..100, or null for "not attempted") to a band. */
export function accuracyBand(accuracy: number | null): PerfBand {
  if (accuracy === null) return 'none'
  if (accuracy >= 80) return 'strong'
  if (accuracy >= 60) return 'ok'
  return 'weak'
}

/** Number of distinct topic-identity accent colors (see .tc-N in index.css). */
export const TOPIC_PALETTE_SIZE = 10

/**
 * Deterministic topicId -> palette index [0, TOPIC_PALETTE_SIZE). Stable
 * across sessions (pure string hash), so a topic always keeps the same
 * accent color. Purely for visual identity — never persisted, and unrelated
 * to performance.
 */
export function topicColorIndex(topicId: string): number {
  let h = 0
  for (let i = 0; i < topicId.length; i++) {
    h = (Math.imul(h, 31) + topicId.charCodeAt(i)) >>> 0
  }
  return h % TOPIC_PALETTE_SIZE
}

export interface TopicStat {
  topicId: string
  title: string
  attempted: number
  correct: number
  /** 0..100 integer accuracy across attempted questions in this topic. */
  accuracy: number
}

export interface StatsSummary {
  /** Distinct approved questions answered at least once. */
  answered: number
  correct: number
  /** Overall accuracy 0..100 (null when nothing answered yet). */
  accuracy: number | null
  totalAvailable: number
  remaining: number
  /** Attempted topics, strongest accuracy first. */
  perTopic: TopicStat[]
  /** Up to 3 weakest attempted topics under 80%, weakest first. */
  focusNext: TopicStat[]
  /** Questions still in the incorrect/review list. */
  stillReviewing: number
}

/**
 * Derive the study-stats summary from saved answers + the question bank.
 * Answers whose question is no longer in the approved bank are ignored so
 * per-topic totals always reconcile with the overall totals.
 */
export function computeStats(
  answers: Record<string, StoredAnswer>,
  questions: Pick<Question, 'id' | 'topicId'>[],
  topics: Pick<Topic, 'id' | 'displayTitle'>[],
  totalAvailable: number,
  stillReviewing: number
): StatsSummary {
  const topicByQuestion = new Map(questions.map((q) => [q.id, q.topicId]))
  const titleByTopic = new Map(topics.map((t) => [t.id, t.displayTitle]))

  const agg = new Map<string, { attempted: number; correct: number }>()
  let answered = 0
  let correct = 0

  for (const id in answers) {
    const topicId = topicByQuestion.get(id)
    if (!topicId) continue // answered question no longer in the approved bank
    answered++
    const isCorrect = answers[id].isCorrect === true
    if (isCorrect) correct++
    const cur = agg.get(topicId) ?? { attempted: 0, correct: 0 }
    cur.attempted++
    if (isCorrect) cur.correct++
    agg.set(topicId, cur)
  }

  const perTopic: TopicStat[] = [...agg.entries()].map(([topicId, s]) => ({
    topicId,
    title: titleByTopic.get(topicId) ?? topicId,
    attempted: s.attempted,
    correct: s.correct,
    accuracy: Math.round((s.correct / s.attempted) * 100),
  }))

  // Topic performance: strongest first (ties: more attempts, then title).
  perTopic.sort(
    (a, b) =>
      b.accuracy - a.accuracy ||
      b.attempted - a.attempted ||
      a.title.localeCompare(b.title)
  )

  // Focus next: weakest attempted topics below 80%, weakest first, up to 3.
  const focusNext = perTopic
    .filter((t) => t.accuracy < 80)
    .slice()
    .sort((a, b) => a.accuracy - b.accuracy || b.attempted - a.attempted)
    .slice(0, 3)

  return {
    answered,
    correct,
    accuracy: answered ? Math.round((correct / answered) * 100) : null,
    totalAvailable,
    remaining: Math.max(0, totalAvailable - answered),
    perTopic,
    focusNext,
    stillReviewing,
  }
}
