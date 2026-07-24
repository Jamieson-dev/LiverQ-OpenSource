import { useEffect, useRef, useState } from 'react'
import type { AnsweredItem, QuizItem, RetryOutcome, Topic } from '../types'
import { AppHeader } from '../components/AppHeader'
import { ProgressBar } from '../components/ProgressBar'
import { QuestionCard } from '../components/QuestionCard'
import { AnswerButton } from '../components/AnswerButton'
import { ExplanationCard } from '../components/ExplanationCard'
import { SourceCard } from '../components/SourceCard'
import { TeachingPearlCard } from '../components/TeachingPearlCard'
import { ReportIssueButton } from '../components/ReportIssueButton'
import { Icon, type IconName } from '../components/Icon'
import {
  recordAnswer,
  isBookmarked,
  toggleBookmark,
  MASTERY_STREAK_TARGET,
} from '../lib/storage'

/** Destinations reachable from the in-quiz menu. Leaving ends the quiz. */
export type QuizNavTarget = 'home' | 'setup' | 'review' | 'stats' | 'profile'

const QUIZ_MENU: { label: string; icon: IconName; target: QuizNavTarget }[] = [
  { label: 'Home', icon: 'home', target: 'home' },
  { label: 'Topics', icon: 'topics', target: 'setup' },
  { label: 'Review incorrect', icon: 'review', target: 'review' },
  { label: 'Stats', icon: 'stats', target: 'stats' },
  { label: 'Study', icon: 'study', target: 'profile' },
]

interface QuizScreenProps {
  items: QuizItem[]
  getTopic: (topicId: string) => Topic | undefined
  onExit: () => void
  onFinish: (answers: AnsweredItem[]) => void
  /** Jump to another section mid-quiz (ends the current quiz session). */
  onNavigate: (target: QuizNavTarget) => void
  /** "Retry Missed Questions" mode: applies mastery tracking per answer. */
  retryMode?: boolean
  /**
   * Called once per answer in retry mode to apply mastery rules. Returns the
   * outcome so the screen can show mastery progress feedback.
   */
  onRetryResult?: (questionId: string, isCorrect: boolean) => RetryOutcome
}

export function QuizScreen({
  items,
  getTopic,
  onExit,
  onFinish,
  onNavigate,
  retryMode = false,
  onRetryResult,
}: QuizScreenProps) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [answered, setAnswered] = useState(false)
  const [result, setResult] = useState<boolean | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [answers, setAnswers] = useState<AnsweredItem[]>([])
  const [bookmarked, setBookmarked] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  // Short-answer: the user's typed recall response (optional).
  const [shortText, setShortText] = useState('')
  // Retry mode: mastery outcome for the current question (feedback only).
  const [retryOutcome, setRetryOutcome] = useState<RetryOutcome | null>(null)
  // Retry mode: mastery outcomes kept per question so revisiting a previous
  // question can still show its mastery feedback (parallel to `answers`).
  const [outcomes, setOutcomes] = useState<(RetryOutcome | null)[]>([])
  // Which question is on screen. Usually the active one (`index`), but the
  // user can page back through already-answered questions (read-only).
  const [viewIndex, setViewIndex] = useState(0)
  // Exiting mid-quiz loses the session, so the header ✕ asks first.
  const [confirmExit, setConfirmExit] = useState(false)
  // The internal scroll container — window scrolling is never used here.
  const scrollRef = useRef<HTMLDivElement>(null)

  const total = items.length
  const current = items[index]
  const q = current.question
  // Short-answer items have no fixed choices; they use a reveal + self-grade flow.
  const isShortAnswer = q.questionType === 'short_answer'

  // What's displayed: the active question, or a previously answered one.
  const viewing = items[viewIndex]
  const vq = viewing.question
  const vIsShortAnswer = vq.questionType === 'short_answer'
  const isHistory = viewIndex < index
  const hist = isHistory ? answers[viewIndex] : null

  // The scroll container persists across questions, so its scrollTop would
  // otherwise carry over — on mobile that left new questions starting
  // scrolled down (stem/choice A hidden, blank space above the button).
  // Reset to the top whenever the displayed question changes. Runs after the
  // new question has rendered; instant jump, so no visible animation.
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [viewIndex, vq.id])

  // Sync the bookmark toggle with storage whenever the displayed question changes.
  useEffect(() => {
    setBookmarked(isBookmarked(vq.id))
  }, [vq.id])

  // Record an answer (used by both choice-based and short-answer flows).
  // Persists the user's actual answer (full text) so the Review screen can
  // show "Your answer" even after a page refresh.
  function record(
    isCorrect: boolean,
    selectedValue: string,
    extra: { userAnswer: string; selectedOptionId?: string; selectedOptionText?: string }
  ) {
    setAnswers((prev) => [...prev, { item: current, selected: selectedValue, isCorrect }])
    recordAnswer({
      questionId: q.id,
      userAnswer: extra.userAnswer,
      correctAnswer: q.correctAnswer,
      isCorrect,
      answeredAt: new Date().toISOString(),
      questionType: q.questionType,
      selectedOptionId: extra.selectedOptionId,
      selectedOptionText: extra.selectedOptionText,
    })
    // Retry mode: apply mastery rules and surface the progress feedback.
    let outcome: RetryOutcome | null = null
    if (retryMode && onRetryResult) {
      outcome = onRetryResult(q.id, isCorrect)
      setRetryOutcome(outcome)
    }
    setOutcomes((prev) => [...prev, outcome])
    setResult(isCorrect)
    setAnswered(true)
  }

  function submit() {
    if (selected == null || answered) return
    const idx = current.choices.indexOf(selected)
    const optionId = idx >= 0 ? String.fromCharCode(65 + idx) : undefined
    record(selected === q.correctAnswer, selected, {
      userAnswer: selected,
      selectedOptionId: optionId,
      selectedOptionText: selected,
    })
  }

  function gradeShortAnswer(gotItRight: boolean) {
    if (answered) return
    const typed = shortText.trim()
    const userAnswer = typed.length ? typed : '(left blank)'
    record(gotItRight, userAnswer, { userAnswer })
  }

  function next() {
    // Paging forward through already-answered questions: just move the view.
    if (isHistory) {
      setViewIndex((v) => v + 1)
      return
    }
    if (index + 1 >= total) {
      onFinish(answers)
      return
    }
    setIndex((i) => i + 1)
    setViewIndex(index + 1)
    setSelected(null)
    setAnswered(false)
    setResult(null)
    setRevealed(false)
    setBookmarked(false)
    setShortText('')
    setRetryOutcome(null)
  }

  function prev() {
    setViewIndex((v) => Math.max(0, v - 1))
  }

  // Forward through already-accessible questions only — capped at the active
  // question (`index`), so future unanswered questions can never be skipped
  // to. Advancing past the active question stays exclusive to next().
  function forward() {
    setViewIndex((v) => Math.min(index, v + 1))
  }

  // Topic stays hidden until the displayed question has been answered.
  const topic = isHistory || answered ? getTopic(vq.topicId) : undefined
  // Show the explanation/source after answering (or after reveal for short-answer).
  const showDetail = isHistory || answered || (isShortAnswer && revealed)
  // Correctness of whatever is displayed (stored for history, live otherwise).
  const shownCorrect = isHistory ? hist!.isCorrect : result
  const shownOutcome = isHistory ? outcomes[viewIndex] ?? null : retryOutcome

  return (
    <div className="screen screen-quiz" style={{ paddingTop: 0 }}>
      <AppHeader
        onBack={() => setConfirmExit(true)}
        backLabel="Exit quiz"
        backIcon="✕"
        right={
          <div className="quiz-actions">
            <button
              className="icon-btn"
              aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark question'}
              onClick={() => setBookmarked(toggleBookmark(vq.id))}
              style={bookmarked ? { color: 'var(--primary)', borderColor: 'var(--primary)' } : undefined}
            >
              {bookmarked ? '★' : '☆'}
            </button>
            <button
              className="icon-btn"
              aria-label="Menu"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <Icon name="menu" size={20} />
            </button>
            {menuOpen && (
              <>
                <div className="menu-backdrop" onClick={() => setMenuOpen(false)} />
                <div className="menu-panel" role="menu">
                  {QUIZ_MENU.map((m) => (
                    <button
                      key={m.target}
                      className="menu-item"
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false)
                        onNavigate(m.target)
                      }}
                    >
                      <Icon name={m.icon} size={18} />
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        }
      />

      {/* Exit confirmation — leaving mid-quiz discards the session, so the
          header ✕ never exits directly. (No native confirm(): it blocks.) */}
      {confirmExit && (
        <>
          <div className="menu-backdrop" onClick={() => setConfirmExit(false)} />
          <div
            className="menu-panel"
            role="alertdialog"
            aria-label="Exit quiz?"
            style={{ position: 'fixed', top: 72, left: 'var(--pad)', right: 'auto', padding: 'var(--s3)', gap: 'var(--s2)', maxWidth: 260 }}
          >
            <p style={{ margin: 0, fontWeight: 700, fontSize: 14.5 }}>Exit this quiz?</p>
            <p className="text-sm" style={{ margin: 0, color: 'var(--muted)' }}>
              Your progress in this session won&apos;t be saved.
            </p>
            <button className="btn btn-secondary" onClick={onExit}>
              Exit to Home
            </button>
            <button className="btn btn-primary" onClick={() => setConfirmExit(false)}>
              Keep practicing
            </button>
          </div>
        </>
      )}

      {/* Progress */}
      <div className="row" style={{ gap: 12 }}>
        {retryMode && (
          <span
            className="text-sm"
            style={{
              fontWeight: 800,
              whiteSpace: 'nowrap',
              color: 'var(--primary)',
              background: 'var(--primary-tint)',
              borderRadius: 'var(--r-sm)',
              padding: '2px 8px',
            }}
          >
            Retry
          </span>
        )}
        <span className="text-sm" style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
          {viewIndex + 1} / {total}
        </span>
        <div style={{ flex: 1 }}>
          <ProgressBar value={(viewIndex + (isHistory || answered ? 1 : 0)) / total} />
        </div>
      </div>

      <div className="scroll-area" ref={scrollRef}>
        {/* Before answering: ONLY number + question text (no topic). */}
        <QuestionCard
          questionNumber={viewIndex + 1}
          total={total}
          question={vq.question}
        />

        {/* Choice-based questions (multiple_choice / true_false).
            History views are read-only: they show the stored selection with
            full correct/incorrect feedback and cannot be changed. */}
        {!vIsShortAnswer && (
          <div className="stack-sm">
            {viewing.choices.map((choice, i) => (
              <AnswerButton
                key={choice}
                index={i}
                label={choice}
                selected={isHistory ? hist!.selected === choice : selected === choice}
                answered={isHistory ? true : answered}
                isCorrectAnswer={choice === vq.correctAnswer}
                onSelect={() => !isHistory && !answered && setSelected(choice)}
              />
            ))}
          </div>
        )}

        {/* Short-answer: type a recall answer before reveal (active question) */}
        {vIsShortAnswer && !isHistory && (
          <div className="card" style={{ background: 'var(--surface-2)' }}>
            <div className="section-label" style={{ margin: '0 0 6px' }}>
              Your answer
            </div>
            <textarea
              className="sa-input"
              value={shortText}
              onChange={(e) => setShortText(e.target.value)}
              disabled={showDetail}
              rows={3}
              placeholder="Type your answer, then reveal the model answer to self-check."
            />
          </div>
        )}

        {/* Short-answer: the stored response when revisiting (read-only) */}
        {vIsShortAnswer && isHistory && (
          <div className="card" style={{ background: 'var(--surface-2)' }}>
            <div className="section-label" style={{ margin: '0 0 6px' }}>
              Your answer
            </div>
            <p style={{ margin: 0 }}>{hist!.selected}</p>
          </div>
        )}

        {/* Short-answer: model answer once revealed */}
        {vIsShortAnswer && showDetail && (
          <div className="card is-correct" style={{ borderColor: 'var(--success)', background: 'var(--success-tint)' }}>
            <div className="section-label" style={{ margin: '0 0 6px' }}>
              Model answer
            </div>
            <p style={{ margin: 0, fontWeight: 700 }}>{vq.correctAnswer}</p>
          </div>
        )}

        {/* After answering / reveal: explanation + source (+ topic after answering) */}
        {showDetail && (
          <>
            {(answered || isHistory) && (
              <div className={`verdict ${shownCorrect ? 'ok' : 'no'}`}>
                {vIsShortAnswer
                  ? shownCorrect
                    ? '✓ Marked correct'
                    : '✗ Marked for review'
                  : shownCorrect
                    ? '✓ Correct'
                    : '✗ Incorrect'}
              </div>
            )}
            {retryMode && (answered || isHistory) && shownOutcome && (
              <div
                className="card"
                style={{
                  textAlign: 'center',
                  padding: '10px 12px',
                  background: shownOutcome.mastered
                    ? 'var(--success-tint)'
                    : 'var(--surface-2)',
                }}
              >
                <p style={{ margin: 0, fontWeight: 700, fontSize: 14.5 }}>
                  {shownOutcome.mastered
                    ? '★ Mastered — removed from missed questions'
                    : shownOutcome.isCorrect
                      ? `Mastery progress: ${shownOutcome.streak} / ${MASTERY_STREAK_TARGET} — one more correct in a row to clear it.`
                      : 'Still missed — mastery progress reset'}
                </p>
              </div>
            )}
            <ExplanationCard
              topic={topic}
              explanation={vq.explanation}
              subtopic={vq.subtopic}
              difficulty={vq.difficulty}
            />
            {vq.teachingPearl && <TeachingPearlCard pearl={vq.teachingPearl} />}
            <SourceCard question={vq} />
            <div style={{ textAlign: 'center' }}>
              <ReportIssueButton
                question={vq}
                topic={topic}
                selectedAnswer={
                  isHistory
                    ? hist!.selected
                    : vIsShortAnswer
                      ? shortText.trim() || null
                      : selected
                }
              />
            </div>
          </>
        )}
      </div>

      {/* Action. Balanced bar: small circular back/forward controls flank the
          large primary button. Both circles always render (stable layout);
          each is disabled when there's nowhere to go. Forward only reaches
          already-accessible questions — never unanswered future ones. */}
      <div className="sticky-actions">
        <div className="row" style={{ gap: 'var(--s2)' }}>
          <button
            className="icon-btn"
            aria-label="Previous question"
            title="Previous question"
            onClick={prev}
            disabled={viewIndex === 0}
            style={viewIndex === 0 ? { opacity: 0.35 } : undefined}
          >
            ‹
          </button>
          <div style={{ flex: 1 }}>
            {isHistory ? (
              <button className="btn btn-primary" onClick={next}>
                Next Question
              </button>
            ) : answered ? (
              <button className="btn btn-primary" onClick={next}>
                {index + 1 >= total ? 'See Results' : 'Next Question'}
              </button>
            ) : isShortAnswer ? (
              revealed ? (
                <div className="grid-2">
                  <button className="btn btn-secondary" onClick={() => gradeShortAnswer(false)}>
                    I was wrong
                  </button>
                  <button className="btn btn-primary" onClick={() => gradeShortAnswer(true)}>
                    I was right
                  </button>
                </div>
              ) : (
                <button className="btn btn-primary" onClick={() => setRevealed(true)}>
                  Reveal Answer
                </button>
              )
            ) : (
              <button className="btn btn-primary" disabled={selected == null} onClick={submit}>
                Submit Answer
              </button>
            )}
          </div>
          <button
            className="icon-btn"
            aria-label="Forward to next answered question"
            title="Next answered question"
            onClick={forward}
            disabled={!isHistory}
            style={!isHistory ? { opacity: 0.35 } : undefined}
          >
            ›
          </button>
        </div>
      </div>
    </div>
  )
}
