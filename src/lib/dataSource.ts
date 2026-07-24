import type { Question, Topic } from '../types'
import { TOPICS } from '../data/topics'
import { TOPIC_COUNTS } from '../data/topicCounts'
import { getQuestionIssues } from './validateQuestion'

const IS_DEV = (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV === true

// ============================================================
// LiverQ — Data source abstraction (the single content swap point)
//
// The whole app reads topics/questions ONLY through this module.
//
// PERFORMANCE: the question bank is NOT part of the initial bundle. It is
// code-split into its own chunk and lazy-loaded on first use via a dynamic
// import(). Counts come from a tiny precomputed map (src/data/topicCounts.ts)
// so the shell renders instantly, and preloadQuestions() warms the bank in
// the background after first paint so starting a quiz still feels instant.
//
// To swap in a remote data source later, keep these signatures and replace
// the bodies with your queries (the question-returning functions are already
// async). This repository ships a small independently written sample bank.
// ============================================================

// Lazily-loaded, validated bank (approved + well-formed only). Cached
// after the first load; concurrent callers share one in-flight import.
let validQuestionsPromise: Promise<Question[]> | null = null

async function loadValidQuestions(): Promise<Question[]> {
  const { QUESTIONS } = await import('../data/questions')

  const valid = QUESTIONS.filter((q) => {
    const issues = getQuestionIssues(q)
    if (issues.length && IS_DEV) {
      // eslint-disable-next-line no-console
      console.warn(`[LiverQ] Dropped malformed question "${q?.id}": ${issues.join('; ')}`)
    }
    return issues.length === 0
  })

  if (IS_DEV) reconcileCounts(valid)
  return valid
}

/** Resolve (and cache) the validated question bank. */
function ensureQuestions(): Promise<Question[]> {
  if (!validQuestionsPromise) validQuestionsPromise = loadValidQuestions()
  return validQuestionsPromise
}

/**
 * Warm the question bank in the background (fire-and-forget). Call once
 * after first paint so the data is ready before the user starts a quiz.
 */
export function preloadQuestions(): void {
  void ensureQuestions()
}

// Dev-only safety net: verify the precomputed TOPIC_COUNTS still match
// the real bank, so counts can never silently drift after data edits.
function reconcileCounts(valid: Question[]): void {
  const actual: Record<string, number> = {}
  for (const q of valid) {
    if (q.status !== 'approved') continue
    actual[q.topicId] = (actual[q.topicId] ?? 0) + 1
  }
  const ids = new Set([...Object.keys(actual), ...Object.keys(TOPIC_COUNTS)])
  for (const id of ids) {
    if ((actual[id] ?? 0) !== (TOPIC_COUNTS[id] ?? 0)) {
      // eslint-disable-next-line no-console
      console.warn(
        `[LiverQ] topicCounts drift for "${id}": precomputed ${TOPIC_COUNTS[id] ?? 0}, actual ${actual[id] ?? 0}. Regenerate src/data/topicCounts.ts.`
      )
    }
  }
}

export function getTopics(): Topic[] {
  return TOPICS
}

export function getTopicById(id: string): Topic | undefined {
  return TOPICS.find((t) => t.id === id)
}

/** Only ever returns valid questions with status === "approved". */
export async function getApprovedQuestions(topicIds?: string[]): Promise<Question[]> {
  const all = await ensureQuestions()
  const set = topicIds ? new Set(topicIds) : null
  return all.filter((q) => q.status === 'approved' && (set ? set.has(q.topicId) : true))
}

/**
 * Total approved questions available across the given topics.
 * Reads the precomputed counts, so it stays synchronous and needs no
 * question content — the Home screen and setup counters rely on this.
 */
export function countApprovedQuestions(topicIds: string[]): number {
  if (!topicIds.length) return 0
  return topicIds.reduce((sum, id) => sum + (TOPIC_COUNTS[id] ?? 0), 0)
}

/** Resolve a set of question ids to approved questions (order preserved). */
export async function getQuestionsByIds(ids: string[]): Promise<Question[]> {
  const approved = await getApprovedQuestions()
  const byId = new Map(approved.map((q) => [q.id, q]))
  return ids.map((id) => byId.get(id)).filter((q): q is Question => Boolean(q))
}
