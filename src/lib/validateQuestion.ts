import type { Question } from '../types'

// ============================================================
// LiverQ — question validation / safeguards
//
// A malformed question must never crash the quiz. The data layer runs every
// question through `isValidQuestion` and simply drops (with a dev warning)
// anything that fails, so a single bad entry can't take down the app.
// ============================================================

const VALID_TYPES = new Set(['multiple_choice', 'true_false', 'short_answer'])

/** Return a list of problems with a question (empty = valid). */
export function getQuestionIssues(q: Question): string[] {
  const issues: string[] = []
  const nonEmpty = (v: unknown): v is string =>
    typeof v === 'string' && v.trim().length > 0

  if (!nonEmpty(q?.id)) issues.push('missing id')
  if (!nonEmpty(q?.topicId)) issues.push('missing topicId')
  if (!nonEmpty(q?.question)) issues.push('missing question stem')
  if (!nonEmpty(q?.explanation)) issues.push('missing explanation')
  if (!nonEmpty(q?.correctAnswer)) issues.push('missing correctAnswer')
  if (!VALID_TYPES.has(q?.questionType)) issues.push(`invalid questionType: ${q?.questionType}`)
  // A citation must exist in either the structured or the flat form.
  if (!nonEmpty(q?.citation?.source) && !nonEmpty(q?.sourceTitle)) {
    issues.push('missing source/citation')
  }

  if (q?.questionType === 'multiple_choice') {
    if (!Array.isArray(q.choices) || q.choices.length < 2) {
      issues.push('MCQ needs at least 2 choices')
    } else if (!q.choices.includes(q.correctAnswer)) {
      issues.push('MCQ correctAnswer not present in choices')
    } else if (new Set(q.choices).size !== q.choices.length) {
      issues.push('MCQ has duplicate choices')
    }
  } else if (q?.questionType === 'true_false') {
    const ok = Array.isArray(q.choices) && q.choices.length === 2 &&
      q.choices.includes('True') && q.choices.includes('False')
    if (!ok) issues.push('true_false choices must be ["True","False"]')
    if (q.correctAnswer !== 'True' && q.correctAnswer !== 'False') {
      issues.push('true_false correctAnswer must be True or False')
    }
  } else if (q?.questionType === 'short_answer') {
    if (Array.isArray(q.choices) && q.choices.length !== 0) {
      issues.push('short_answer must have no choices')
    }
  }

  return issues
}

/** True when a question is safe to render. */
export function isValidQuestion(q: Question): boolean {
  return getQuestionIssues(q).length === 0
}
