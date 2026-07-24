import type { Question, Topic } from '../types'

// ============================================================
// LiverQ — "Report question issue" mailto builder.
//
// Local-only: this constructs a mailto: link and nothing else. No network
// request, no storage, no analytics. The user's own email client opens with
// a prefilled draft; nothing is sent until the user sends it themselves.
// ============================================================

const RECIPIENT = 'jamie.son.apps@gmail.com'

// Practical ceiling for a mailto URL (OS/browser handlers vary; stay well under
// ~2000 chars). If the full body would exceed this, fall back to a prioritized
// shorter body.
const MAX_MAILTO_LEN = 1900

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']
const PHI_WARNING =
  'Do not include patient identifiers or protected health information.'
const PROMPT =
  'Please describe what seems incorrect, unclear, outdated, or confusing:'

export interface ReportContext {
  question: Question
  /** Resolved topic (for the human-readable title), when available. */
  topic?: Topic
  /** The user's selected/typed answer, when available. */
  selectedAnswer?: string | null
}

function appUrl(): string {
  return typeof window !== 'undefined' ? window.location.origin : ''
}

function fullBody({ question: q, topic, selectedAnswer }: ReportContext): string {
  const choices = q.choices
    .map((c, i) => `${LETTERS[i] ?? '-'}. ${c}`)
    .join('\n')
  return [
    'LiverQ question issue report',
    '',
    `Question ID: ${q.id}`,
    `Topic ID: ${q.topicId}`,
    `Topic: ${topic?.displayTitle ?? '(not available)'}`,
    '',
    'Question:',
    q.question,
    '',
    'Answer choices:',
    choices,
    '',
    `Your answer: ${selectedAnswer ? selectedAnswer : '(not recorded)'}`,
    `Correct answer: ${q.correctAnswer}`,
    '',
    'Explanation:',
    q.explanation,
    '',
    `Source title: ${q.sourceTitle}`,
    `Source year: ${q.sourceYear}`,
    `Source section: ${q.sourceSection}`,
    `Official URL: ${q.officialUrl || '(none)'}`,
    `App URL: ${appUrl()}`,
    '',
    PROMPT,
    '',
    '',
    PHI_WARNING,
  ].join('\n')
}

// Prioritized shorter body (drops Topic ID, full choice list, and explanation).
function shortBody({ question: q, topic, selectedAnswer }: ReportContext): string {
  const src = [q.sourceTitle, q.sourceYear && `(${q.sourceYear})`, q.sourceSection]
    .filter(Boolean)
    .join(' ')
  return [
    'LiverQ question issue report',
    '',
    `Question ID: ${q.id}`,
    `Topic: ${topic?.displayTitle ?? '(not available)'}`,
    '',
    'Question:',
    q.question,
    '',
    `Your answer: ${selectedAnswer ? selectedAnswer : '(not recorded)'}`,
    `Correct answer: ${q.correctAnswer}`,
    '',
    `Source: ${src}`,
    `Official URL: ${q.officialUrl || '(none)'}`,
    `App URL: ${appUrl()}`,
    '',
    PROMPT,
    '',
    '',
    PHI_WARNING,
  ].join('\n')
}

/** Build the mailto: href for reporting an issue with a question. */
export function buildReportMailto(ctx: ReportContext): string {
  const subject = `LiverQ question issue: ${ctx.question.id}`
  const encSubject = encodeURIComponent(subject)
  const make = (body: string) =>
    `mailto:${RECIPIENT}?subject=${encSubject}&body=${encodeURIComponent(body)}`

  const full = make(fullBody(ctx))
  return full.length <= MAX_MAILTO_LEN ? full : make(shortBody(ctx))
}
