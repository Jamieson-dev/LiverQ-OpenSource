import { useEffect, useMemo, useState } from 'react'
import type { AnsweredItem, QuizItem, RetryOutcome, ReviewMode, Screen } from './types'
import {
  getTopics,
  getTopicById,
  countApprovedQuestions,
  preloadQuestions,
} from './lib/dataSource'
import { buildQuiz, buildRetryQuiz, DEFAULT_QUESTION_COUNT } from './lib/quiz'
import { getBookmarks, getIncorrect, recordRetryResult } from './lib/storage'
import { HomeScreen } from './screens/HomeScreen'
import { QuizSetupScreen } from './screens/QuizSetupScreen'
import { QuizScreen } from './screens/QuizScreen'
import { ResultScreen } from './screens/ResultScreen'
import { RetryResultScreen } from './screens/RetryResultScreen'
import { ReviewScreen } from './screens/ReviewScreen'
import { StatsScreen } from './screens/StatsScreen'
import { ProfileScreen } from './screens/ProfileScreen'
import { AbbreviationsScreen } from './screens/AbbreviationsScreen'
import { BottomTabBar, type TabItem } from './components/BottomTabBar'

const DEFAULT_COUNT = DEFAULT_QUESTION_COUNT

export default function App() {
  const topics = useMemo(() => getTopics(), [])

  const [screen, setScreen] = useState<Screen>('home')
  const [reviewMode, setReviewMode] = useState<ReviewMode>('incorrect')
  // Screen to return to when leaving Review (so it works from Home, the
  // normal result, and the retry summary alike).
  const [reviewOrigin, setReviewOrigin] = useState<Screen>('home')

  // Persisted selection across Home <-> Setup. Defaults to all available topics.
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(topics.filter((t) => t.enabled && t.approvedQuestionCount > 0).map((t) => t.id))
  )

  const [quizItems, setQuizItems] = useState<QuizItem[]>([])
  const [lastAnswers, setLastAnswers] = useState<AnsweredItem[]>([])
  const [lastTopicIds, setLastTopicIds] = useState<string[]>([])

  // Distinguishes a normal quiz from a "Retry Missed Questions" session so
  // finishing routes to the right summary. Retry outcomes drive that summary.
  const [quizKind, setQuizKind] = useState<'normal' | 'retry'>('normal')
  const [retryOutcomes, setRetryOutcomes] = useState<RetryOutcome[]>([])

  // counter to force re-read of localStorage-derived counts after a quiz
  const [storageVersion, setStorageVersion] = useState(0)

  // Guards against double-starts while the (lazy) question bank resolves.
  const [starting, setStarting] = useState(false)

  // Warm the lazy-loaded question bank in the background right after the
  // shell paints, so starting a quiz is instant without shipping ~1.9 MB
  // of question content in the initial bundle.
  useEffect(() => {
    preloadQuestions()
  }, [])

  const selectedIdList = useMemo(() => Array.from(selectedIds), [selectedIds])
  const approvedForSelection = useMemo(
    () => countApprovedQuestions(selectedIdList),
    [selectedIdList]
  )

  const incorrectCount = useMemo(() => getIncorrect().length, [storageVersion, screen])
  const bookmarkCount = useMemo(() => getBookmarks().length, [storageVersion, screen])

  async function startQuiz(ids: string[], count: number) {
    if (starting) return
    setStarting(true)
    try {
      const items = await buildQuiz(ids, count)
      if (items.length === 0) return
      setQuizKind('normal')
      setQuizItems(items)
      setLastTopicIds(ids)
      setScreen('quiz')
    } finally {
      setStarting(false)
    }
  }

  function startMixedQuiz() {
    void startQuiz(selectedIdList, Math.min(DEFAULT_COUNT, approvedForSelection))
  }

  /** Start a "Retry Missed Questions" session over the current missed ids. */
  async function startRetry() {
    if (starting) return
    setStarting(true)
    try {
      const items = await buildRetryQuiz(getIncorrect())
      if (items.length === 0) {
        // No missed questions to retry — send the user to the (empty) review
        // list, which shows the friendly "build your review set" state.
        openReview('incorrect')
        return
      }
      setRetryOutcomes([])
      setQuizKind('retry')
      setQuizItems(items)
      setScreen('quiz')
    } finally {
      setStarting(false)
    }
  }

  /** Apply mastery rules for one retry answer and record its outcome. */
  function handleRetryResult(id: string, isCorrect: boolean): RetryOutcome {
    const outcome = recordRetryResult(id, isCorrect)
    setRetryOutcomes((prev) => [...prev, outcome])
    return outcome
  }

  function finishQuiz(answers: AnsweredItem[]) {
    setLastAnswers(answers)
    setStorageVersion((v) => v + 1)
    setScreen(quizKind === 'retry' ? 'retryResult' : 'result')
  }

  function openReview(mode: ReviewMode) {
    // Remember where we came from so "Done" returns there. Opening review
    // from within review keeps the prior origin; from an ended quiz, go home.
    const origin: Screen =
      screen === 'review' ? reviewOrigin : screen === 'quiz' ? 'home' : screen
    setReviewOrigin(origin)
    setReviewMode(mode)
    setScreen('review')
  }

  const topicsIncluded = useMemo(
    () =>
      lastTopicIds
        .map((id) => getTopicById(id))
        .filter((t): t is NonNullable<typeof t> => Boolean(t)),
    [lastTopicIds]
  )

  // Bottom tab bar: shown on main screens, hidden during active quiz questions
  // and on the pushed Abbreviations sub-screen (which has its own back button).
  const showTabs = screen !== 'quiz' && screen !== 'abbreviations'
  const activeTab: Screen | null =
    screen === 'review'
      ? reviewMode === 'incorrect'
        ? 'review'
        : null
      : screen === 'result' || screen === 'retryResult'
        ? null
        : screen
  const tabItems: TabItem[] = [
    { key: 'home', label: 'Home', icon: 'home', onSelect: () => setScreen('home') },
    { key: 'setup', label: 'Topics', icon: 'topics', onSelect: () => setScreen('setup') },
    { key: 'review', label: 'Review', icon: 'review', onSelect: () => openReview('incorrect') },
    { key: 'stats', label: 'Stats', icon: 'stats', onSelect: () => setScreen('stats') },
    { key: 'profile', label: 'Study', icon: 'study', onSelect: () => setScreen('profile') },
  ]

  return (
    <div className="app-shell">
      {screen === 'home' && (
        <HomeScreen
          selectedTopicCount={selectedIds.size}
          approvedQuestionCount={approvedForSelection}
          incorrectCount={incorrectCount}
          bookmarkCount={bookmarkCount}
          onStartMixedQuiz={startMixedQuiz}
          onChooseTopics={() => setScreen('setup')}
          onReviewIncorrect={() => openReview('incorrect')}
          onReviewBookmarks={() => openReview('bookmarks')}
        />
      )}

      {screen === 'setup' && (
        <QuizSetupScreen
          topics={topics}
          initialSelected={selectedIds}
          initialCount={DEFAULT_COUNT}
          onBack={() => setScreen('home')}
          onChangeSelection={setSelectedIds}
          onStart={startQuiz}
        />
      )}

      {screen === 'quiz' && (
        <QuizScreen
          items={quizItems}
          getTopic={getTopicById}
          onExit={() => setScreen('home')}
          onFinish={finishQuiz}
          onNavigate={(target) =>
            target === 'review' ? openReview('incorrect') : setScreen(target)
          }
          retryMode={quizKind === 'retry'}
          onRetryResult={handleRetryResult}
        />
      )}

      {screen === 'result' && (
        <ResultScreen
          answers={lastAnswers}
          topicsIncluded={topicsIncluded}
          onReviewIncorrect={() => openReview('incorrect')}
          onRestart={() => startQuiz(lastTopicIds, lastAnswers.length || DEFAULT_COUNT)}
          onHome={() => setScreen('home')}
        />
      )}

      {screen === 'retryResult' && (
        <RetryResultScreen
          outcomes={retryOutcomes}
          onRetryAgain={startRetry}
          onReviewMissed={() => openReview('incorrect')}
          onHome={() => setScreen('home')}
        />
      )}

      {screen === 'review' && (
        <ReviewScreen
          mode={reviewMode}
          getTopic={getTopicById}
          sessionAnswers={reviewMode === 'incorrect' ? lastAnswers : undefined}
          onBack={() => setScreen(reviewOrigin)}
          onRetry={startRetry}
        />
      )}

      {screen === 'stats' && (
        <StatsScreen />
      )}

      {screen === 'profile' && (
        <ProfileScreen onOpenAbbreviations={() => setScreen('abbreviations')} />
      )}

      {screen === 'abbreviations' && (
        <AbbreviationsScreen onBack={() => setScreen('profile')} />
      )}

      {showTabs && <BottomTabBar active={activeTab} items={tabItems} />}
    </div>
  )
}
