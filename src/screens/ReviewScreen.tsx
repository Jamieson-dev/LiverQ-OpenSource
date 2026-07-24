import { useEffect, useState } from 'react'
import type { AnsweredItem, Question, QuestionType, ReviewMode, Topic } from '../types'
import { AppHeader } from '../components/AppHeader'
import { ExplanationCard } from '../components/ExplanationCard'
import { SourceCard } from '../components/SourceCard'
import { TeachingPearlCard } from '../components/TeachingPearlCard'
import { ReportIssueButton } from '../components/ReportIssueButton'
import { getQuestionsByIds } from '../lib/dataSource'
import { getAnswerDetail, getBookmarks, getIncorrect } from '../lib/storage'

interface ReviewScreenProps {
  mode: ReviewMode
  getTopic: (topicId: string) => Topic | undefined
  /** When reviewing the most recent quiz, pass its answers for "your answer" context. */
  sessionAnswers?: AnsweredItem[]
  onBack: () => void
  /** Start a "Retry Missed Questions" session (incorrect mode only). */
  onRetry?: () => void
}

interface ReviewEntry {
  question: Question
  /** Full text of the user's answer; null when it was never saved (old session). */
  yourAnswer: string | null
  /** True once we know the answer state (vs. an old item with nothing saved). */
  hasAnswer: boolean
  /** Display-order letter of the selected choice, when available. */
  optionId?: string
  questionType: QuestionType
}

export function ReviewScreen({
  mode,
  getTopic,
  sessionAnswers,
  onBack,
  onRetry,
}: ReviewScreenProps) {
  const title = mode === 'incorrect' ? 'Review Incorrect' : 'Bookmarks'

  // null = still resolving (the question bank lazy-loads on first use).
  const [entries, setEntries] = useState<ReviewEntry[] | null>(null)

  // Build the list of questions to review.
  useEffect(() => {
    // Prefer the just-finished session for the richest "your answer"
    // context — available synchronously, no bank load needed.
    if (mode === 'incorrect' && sessionAnswers && sessionAnswers.length) {
      setEntries(
        sessionAnswers
          .filter((a) => !a.isCorrect)
          .map((a) => ({
            question: a.item.question,
            yourAnswer: a.selected,
            hasAnswer: true,
            questionType: a.item.question.questionType,
          }))
      )
      return
    }

    // Otherwise resolve from storage (survives page refresh). This awaits
    // the lazy-loaded question bank.
    const ids = mode === 'incorrect' ? getIncorrect() : getBookmarks()
    if (ids.length === 0) {
      setEntries([])
      return
    }

    let cancelled = false
    setEntries(null)
    getQuestionsByIds(ids).then((questions) => {
      if (cancelled) return
      setEntries(
        questions.map((question) => {
          const detail = getAnswerDetail(question.id)
          return {
            question,
            yourAnswer: detail ? detail.userAnswer : null,
            // Bookmarks may never have been answered; only flag "missing" for incorrect review.
            hasAnswer: detail ? true : mode !== 'incorrect',
            optionId: detail?.selectedOptionId,
            questionType: question.questionType,
          }
        })
      )
    })
    return () => {
      cancelled = true
    }
  }, [mode, sessionAnswers])

  return (
    <div className="screen screen-review" style={{ paddingTop: 0 }}>
      <AppHeader title={title} onBack={onBack} />

      <div className="scroll-area">
        {entries === null ? (
          <div className="empty-state">
            <p className="text-sm">Loading…</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="empty-state">
            <div className="emoji">{mode === 'incorrect' ? '🎯' : '🔖'}</div>
            <p style={{ fontWeight: 700, color: 'var(--text)' }}>
              {mode === 'incorrect' ? 'No missed questions yet' : 'No bookmarks yet'}
            </p>
            <p className="text-sm">
              {mode === 'incorrect'
                ? 'Complete a quiz to build your review set.'
                : 'Tap the bookmark icon during a quiz to save questions here.'}
            </p>
          </div>
        ) : (
          <>
            {/* Mastery-rule hint: plain scrollable content at the top of the
                list (not sticky), so it never eats bottom reading space. */}
            {mode === 'incorrect' && (
              <p
                className="text-sm muted"
                style={{ margin: '0 2px', textAlign: 'center', lineHeight: 1.5 }}
              >
                Answer each question correctly twice in a row to clear it from
                this list.
              </p>
            )}
            {entries.map((entry) => {
            const { question, yourAnswer, hasAnswer, optionId, questionType } = entry
            const topic = getTopic(question.topicId)
            const showYourAnswer = mode === 'incorrect'
            const yourAnswerText =
              optionId && yourAnswer ? `${optionId}. ${yourAnswer}` : yourAnswer

            return (
              <div key={question.id} className="stack-sm">
                {/* 1. Question stem */}
                <div className="card">
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 15.5, lineHeight: 1.4 }}>
                    {question.question}
                  </p>
                </div>

                {/* 2. Your answer (error-style) */}
                {showYourAnswer && (
                  <div
                    className={`rev-card rev-your${hasAnswer ? '' : ' is-missing'}`}
                  >
                    <p className="rev-label">Your answer</p>
                    {hasAnswer && yourAnswerText ? (
                      <>
                        <p className="rev-text">{yourAnswerText}</p>
                        {questionType === 'short_answer' && (
                          <p className="text-sm muted" style={{ margin: '4px 0 0' }}>
                            Self-assessed: needs review
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="rev-text is-fallback">
                        Your previous answer was not saved for this item.
                      </p>
                    )}
                  </div>
                )}

                {/* 3. Correct answer (success-style) */}
                <div className="rev-card rev-correct">
                  <p className="rev-label">Correct answer</p>
                  <p className="rev-text">{question.correctAnswer}</p>
                </div>

                {/* 4. Explanation */}
                <ExplanationCard
                  topic={topic}
                  explanation={question.explanation}
                  subtopic={question.subtopic}
                  difficulty={question.difficulty}
                />

                {/* 5. Teaching pearl (optional) */}
                {question.teachingPearl && (
                  <TeachingPearlCard pearl={question.teachingPearl} />
                )}

                {/* 6. Source */}
                <SourceCard question={question} />

                {/* 7. Report an issue with this question (mailto only) */}
                <div style={{ textAlign: 'center' }}>
                  <ReportIssueButton
                    question={question}
                    topic={topic}
                    selectedAnswer={showYourAnswer ? yourAnswer : null}
                  />
                </div>

                <div className="divider" />
              </div>
            )
          })}
          </>
        )}
      </div>

      {/* Incorrect: pin "Retry Missed Questions" to the bottom so it stays
          reachable without scrolling (no Done button — top back + bottom tabs
          are the exits). Bookmarks keeps its existing Done action. */}
      {mode === 'incorrect'
        ? onRetry &&
          entries !== null &&
          entries.length > 0 && (
            <div className="sticky-actions">
              <button className="btn btn-primary" onClick={onRetry}>
                Retry Missed Questions
              </button>
            </div>
          )
        : (
          <div className="sticky-actions">
            <button className="btn btn-secondary" onClick={onBack}>
              Done
            </button>
          </div>
        )}
    </div>
  )
}
