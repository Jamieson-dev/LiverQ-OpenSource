// ============================================================
// LiverQ — lightweight localStorage persistence for the
// "Review & Learn" feature (bookmarks + incorrect answers).
//
// Two stores:
//  - ID lists (bookmarks, incorrect) — back-compat, drive counts.
//  - Answer detail map (liverq:answers) — the user's actual answer
//    for every answered question, so Review can show "Your answer"
//    even after a page refresh. Keyed by question id.
//
// Full question data is resolved from the data source. This keeps
// it trivial to move to per-user tables in a remote backend later.
// ============================================================

import type { RetryOutcome, StoredAnswer } from '../types'

const BOOKMARKS_KEY = 'liverq:bookmarks'
const INCORRECT_KEY = 'liverq:incorrect'
const ANSWERS_KEY = 'liverq:answers'
const MASTERY_KEY = 'liverq:mastery'

/**
 * Consecutive correct retries needed to "master" a missed question and
 * remove it from the active missed-questions list.
 */
export const MASTERY_STREAK_TARGET = 2

function read(key: string): string[] {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : []
  } catch {
    return []
  }
}

function write(key: string, ids: string[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(Array.from(new Set(ids))))
  } catch {
    /* ignore quota / privacy mode errors */
  }
}

export function getBookmarks(): string[] {
  return read(BOOKMARKS_KEY)
}

export function isBookmarked(id: string): boolean {
  return read(BOOKMARKS_KEY).includes(id)
}

export function toggleBookmark(id: string): boolean {
  const ids = read(BOOKMARKS_KEY)
  const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]
  write(BOOKMARKS_KEY, next)
  return next.includes(id)
}

export function getIncorrect(): string[] {
  return read(INCORRECT_KEY)
}

/** Record a question id as answered incorrectly (deduped). */
export function addIncorrect(id: string): void {
  write(INCORRECT_KEY, [...read(INCORRECT_KEY), id])
}

/** Remove from the incorrect list (e.g. after getting it right in review). */
export function clearIncorrect(id: string): void {
  write(
    INCORRECT_KEY,
    read(INCORRECT_KEY).filter((x) => x !== id)
  )
}

// ---- Missed-questions retry / mastery (correctStreak per question) ----
//
// "Missed questions" are simply the ids in INCORRECT_KEY. The mastery map
// tracks a per-question correctStreak used by the Retry Missed Questions mode.
// When a question reaches MASTERY_STREAK_TARGET it is removed from the missed
// list (and its streak entry dropped), gradually narrowing the review set.

/** The active missed-question ids (alias of the incorrect list). */
export function getMissedIds(): string[] {
  return getIncorrect()
}

function readMastery(): Record<string, number> {
  try {
    const raw = localStorage.getItem(MASTERY_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, number>)
      : {}
  } catch {
    return {}
  }
}

function writeMastery(map: Record<string, number>): void {
  try {
    localStorage.setItem(MASTERY_KEY, JSON.stringify(map))
  } catch {
    /* ignore quota / privacy mode errors */
  }
}

/** Current consecutive-correct streak for a missed question (0 if none). */
export function getCorrectStreak(id: string): number {
  return readMastery()[id] ?? 0
}

/**
 * Apply the retry-mode mastery rules for a single answered question:
 *  - correct  -> increment correctStreak; at MASTERY_STREAK_TARGET the
 *                question is mastered and removed from the missed list.
 *  - incorrect-> reset correctStreak to 0 and keep it in the missed list.
 * Returns the outcome (streak AFTER this answer, and whether it mastered).
 */
export function recordRetryResult(id: string, isCorrect: boolean): RetryOutcome {
  const map = readMastery()

  if (!isCorrect) {
    map[id] = 0
    writeMastery(map)
    addIncorrect(id) // keep it in the missed list (deduped)
    return { questionId: id, isCorrect: false, streak: 0, mastered: false }
  }

  const streak = (map[id] ?? 0) + 1
  if (streak >= MASTERY_STREAK_TARGET) {
    delete map[id]
    writeMastery(map)
    clearIncorrect(id) // mastered: drop from the active missed list
    return { questionId: id, isCorrect: true, streak, mastered: true }
  }

  map[id] = streak
  writeMastery(map)
  return { questionId: id, isCorrect: true, streak, mastered: false }
}

// ---- Answer detail store (the user's actual answer per question) ----

function readAnswers(): Record<string, StoredAnswer> {
  try {
    const raw = localStorage.getItem(ANSWERS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, StoredAnswer>)
      : {}
  } catch {
    return {}
  }
}

function writeAnswers(map: Record<string, StoredAnswer>): void {
  try {
    localStorage.setItem(ANSWERS_KEY, JSON.stringify(map))
  } catch {
    /* ignore quota / privacy mode errors */
  }
}

/**
 * Persist the user's actual answer for an answered question (any type).
 * Upserts the detail map and keeps the legacy incorrect ID list in sync
 * so existing counts and old read paths keep working.
 */
export function recordAnswer(answer: StoredAnswer): void {
  const map = readAnswers()
  map[answer.questionId] = answer
  writeAnswers(map)
  if (!answer.isCorrect) addIncorrect(answer.questionId)
}

/** Look up the saved answer detail for a question id (undefined if none). */
export function getAnswerDetail(id: string): StoredAnswer | undefined {
  return readAnswers()[id]
}

/**
 * Read-only snapshot of every saved answer (questionId -> latest answer).
 * Used to derive on-device study stats; never mutated by the reader.
 */
export function getAllAnswers(): Record<string, StoredAnswer> {
  return readAnswers()
}

/**
 * Clear ALL local study progress from this device.
 *
 * Storage audit: these four keys are the ONLY persisted study-progress
 * keys in the app, and all four are cleared here:
 *   - liverq:incorrect  (incorrect / missed questions to review)
 *   - liverq:bookmarks  (bookmarked questions)
 *   - liverq:answers    (saved user answers / review detail)
 *   - liverq:mastery    (retry-mode correctStreak per missed question)
 *
 * Everything else is React state only and is NOT persisted, so it resets
 * on its own and needs no clearing here:
 *   - selected topics, quiz length/settings  (App state)
 *   - the in-progress quiz session            (App state; lost on refresh)
 *   - completed quiz results / review history (App state: lastAnswers)
 *   - stats (derived live from the keys above)
 *
 * No UI-preference keys are intentionally retained (there are none).
 * Local-only; there is no account or cloud sync.
 */
export function clearAllLocalProgress(): void {
  try {
    localStorage.removeItem(INCORRECT_KEY)
    localStorage.removeItem(BOOKMARKS_KEY)
    localStorage.removeItem(ANSWERS_KEY)
    localStorage.removeItem(MASTERY_KEY)
  } catch {
    /* ignore quota / privacy mode errors */
  }
}
