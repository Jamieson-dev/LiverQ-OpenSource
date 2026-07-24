import type { QuizItem } from '../types'
import { getApprovedQuestions, getQuestionsByIds } from './dataSource'

// ============================================================
// LiverQ — quiz building logic
// ============================================================

/** Fisher-Yates shuffle returning a NEW array. */
export function shuffle<T>(input: readonly T[]): T[] {
  const a = input.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Display order for a question's choices.
 *  - true_false: ALWAYS A. True / B. False (never shuffled) — testers expect
 *    the canonical order, and answer checking is by value so position is
 *    irrelevant to correctness. Canonical order is enforced here rather than
 *    trusting stored order, so any future item is safe.
 *  - everything else (multiple_choice): shuffled so position carries no cue.
 */
export function displayChoices(question: QuizItem['question']): string[] {
  if (question.questionType === 'true_false') return ['True', 'False']
  return shuffle(question.choices)
}

/**
 * Build a randomized quiz from the selected topics.
 *  - pulls ONLY approved questions
 *  - randomly mixes across all selected topics
 *  - shuffles answer choices per question
 *  - caps at the requested count (or fewer if not enough exist)
 */
export async function buildQuiz(
  topicIds: string[],
  requestedCount: number
): Promise<QuizItem[]> {
  const pool = await getApprovedQuestions(topicIds)
  const mixed = shuffle(pool).slice(0, Math.max(0, requestedCount))
  return mixed.map((question) => ({
    question,
    choices: displayChoices(question),
  }))
}

/**
 * Build a retry quiz from an explicit list of question ids (the missed
 * questions). Resolves only ids that still map to approved questions, keeps
 * the full set (no count cap), and shuffles both order and answer choices.
 */
export async function buildRetryQuiz(ids: string[]): Promise<QuizItem[]> {
  const questions = await getQuestionsByIds(ids)
  return shuffle(questions).map((question) => ({
    question,
    choices: displayChoices(question),
  }))
}

export const QUESTION_COUNT_OPTIONS = [10, 25, 50, 100] as const
export type QuestionCountOption = (typeof QUESTION_COUNT_OPTIONS)[number]

/** Default number of questions per quiz. */
export const DEFAULT_QUESTION_COUNT = 25
