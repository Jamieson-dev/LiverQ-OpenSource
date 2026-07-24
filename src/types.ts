// ============================================================
// LiverQ — shared types
// The data layer reads through these shapes, so the local sample
// data can be swapped for another data source without UI changes.
// ============================================================

export interface Topic {
  id: string
  /** Full topic title (kept distinct so a future localized label could differ). */
  officialTitle: string
  /** Title shown in the topic list. */
  displayTitle: string
  /** URL-friendly short slug — used for routing/keys only, never shown in the list. */
  slug: string
  enabled: boolean
  /** Number of status === "approved" questions. Derived from the question bank. */
  approvedQuestionCount: number
}

/**
 * A hepatology abbreviation glossary entry. Only `abbreviation` and `fullName`
 * are ever shown in the UI; `aliases` are internal search-only synonyms and
 * must never render.
 */
export interface Abbreviation {
  abbreviation: string
  fullName: string
  aliases?: string[]
}

export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer'

export type QuestionStatus = 'draft' | 'approved' | 'rejected' | 'outdated'

export type Difficulty = 'easy' | 'moderate' | 'hard'

/**
 * Structured source citation. Preferred over the flat source* fields.
 * The flat fields on Question are kept in sync for backward compatibility
 * (older content and the SourceCard both still work).
 */
export interface Citation {
  /** Source title. */
  source: string
  year?: string
  /** Section / statement / figure reference within the source. */
  section?: string
  /** Link to the official source (never the copyrighted body text). */
  url?: string
}

/**
 * Canonical runtime question consumed by the UI and data layer.
 *
 * Authoring note: new content should be written with the clean input format
 * (see `defineQuestion` in src/data/defineQuestion.ts) which normalizes into
 * this shape. The `subtopic`, `difficulty`, `teachingPearl`, and `citation`
 * fields are OPTIONAL so existing content remains valid.
 */
export interface Question {
  id: string
  topicId: string
  /** Optional finer-grained grouping within a topic (e.g. "Diagnosis"). */
  subtopic?: string
  /** Optional difficulty tag. */
  difficulty?: Difficulty
  questionType: QuestionType
  /** The question stem. */
  question: string
  /** Full option list (already includes the correct answer). */
  choices: string[]
  correctAnswer: string
  /** Short, original explanation. Never reproduce copyrighted source text. */
  explanation: string
  /** Optional one-line high-yield takeaway shown after answering. */
  teachingPearl?: string
  /** Structured citation (preferred). Flat fields below stay in sync. */
  citation?: Citation
  // ---- Flat citation fields (legacy; kept in sync with `citation`) ----
  sourceTitle: string
  sourceYear: string
  sourceSection: string
  officialUrl: string
  status: QuestionStatus
}

/** A question prepared for the quiz: choices are pre-shuffled for display. */
export interface QuizItem {
  question: Question
  /** Display order of choices (shuffled copy of question.choices). */
  choices: string[]
}

/** A single answered item in a finished/active session. */
export interface AnsweredItem {
  item: QuizItem
  selected: string
  isCorrect: boolean
}

/**
 * Persisted record of a single answered question. Stored per question id so
 * the Review screen can show the user's actual answer even after a page
 * refresh (when in-memory session state is gone). Mirrors a future
 * per-user answers table.
 */
export interface StoredAnswer {
  questionId: string
  /** Full text of the answer the user selected or typed. */
  userAnswer: string
  correctAnswer: string
  isCorrect: boolean
  /** ISO timestamp of when the question was answered. */
  answeredAt: string
  questionType: QuestionType
  /** Display-order letter (A/B/C/D) of the selected choice, when applicable. */
  selectedOptionId?: string
  /** Full text of the selected choice, when applicable (MCQ / true-false). */
  selectedOptionText?: string
}

/**
 * Outcome of answering one question during a "Retry Missed Questions"
 * session. `streak` is the correctStreak AFTER this answer (0 when reset by
 * a wrong answer). `mastered` is true when this answer pushed the question to
 * the mastery threshold, removing it from the active missed-questions list.
 */
export interface RetryOutcome {
  questionId: string
  isCorrect: boolean
  streak: number
  mastered: boolean
}

export type Screen =
  | 'home'
  | 'setup'
  | 'quiz'
  | 'result'
  | 'retryResult'
  | 'review'
  | 'stats'
  | 'profile'
  | 'abbreviations'

export type ReviewMode = 'incorrect' | 'bookmarks'
