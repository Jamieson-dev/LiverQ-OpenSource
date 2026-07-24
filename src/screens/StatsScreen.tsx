import { useEffect, useState } from 'react'
import { AppHeader } from '../components/AppHeader'
import {
  getApprovedQuestions,
  getTopics,
  countApprovedQuestions,
} from '../lib/dataSource'
import { getAllAnswers, getIncorrect } from '../lib/storage'
import {
  computeStats,
  accuracyBand,
  topicColorIndex,
  type PerfBand,
  type StatsSummary,
  type TopicStat,
} from '../lib/stats'

/**
 * On-device learning-performance dashboard. Every number is derived from
 * data the app already saves (answers + review list) joined with the
 * question bank — nothing is invented and nothing new is tracked.
 *
 * Layout: overall accuracy summary, then one clean subject-score card per
 * attempted topic (title, accuracy %, correct/attempted, a bright
 * topic-colored progress bar), then a quiet review-progress card.
 */
export function StatsScreen() {
  // null = still resolving the (lazy-loaded) question bank.
  const [summary, setSummary] = useState<StatsSummary | null>(null)

  useEffect(() => {
    let cancelled = false
    getApprovedQuestions().then((questions) => {
      if (cancelled) return
      const topics = getTopics()
      const total = countApprovedQuestions(topics.map((t) => t.id))
      setSummary(
        computeStats(getAllAnswers(), questions, topics, total, getIncorrect().length)
      )
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="screen screen-stats" style={{ paddingTop: 0 }}>
      <AppHeader title="Stats" />
      <div className="scroll-area">
        {summary === null ? (
          <div className="empty-state">
            <p className="text-sm">Loading…</p>
          </div>
        ) : summary.answered === 0 ? (
          <div className="empty-state">
            <div className="emoji">📊</div>
            <p style={{ fontWeight: 700, color: 'var(--text)' }}>No stats yet</p>
            <p className="text-sm">Start a quiz to build your stats.</p>
          </div>
        ) : (
          <Dashboard s={summary} />
        )}
      </div>
    </div>
  )
}

function Dashboard({ s }: { s: StatsSummary }) {
  return (
    <>
      <p className="text-sm muted" style={{ margin: '0 2px', lineHeight: 1.5 }}>
        Track performance by topic to know where you need to focus.
      </p>

      {/* Overall progress */}
      <div className="section-label" style={{ margin: 0 }}>
        Overall progress
      </div>
      <div className="card overall-card">
        <AccuracyRing value={s.accuracy ?? 0} band={accuracyBand(s.accuracy)} />
        <div className="overall-stats">
          <MiniStat label="Answered" value={`${s.answered}`} />
          <MiniStat label="Total questions" value={`${s.totalAvailable}`} />
          <MiniStat label="Remaining" value={`${s.remaining}`} />
        </div>
      </div>

      {/* Topic performance — one clean subject-score card per topic */}
      <div className="section-label">Topic performance</div>
      <div className="stack">
        {s.perTopic.map((t) => (
          <ScoreCard key={t.topicId} t={t} />
        ))}
      </div>

      {/* Review progress — quiet */}
      <div className="section-label">Review progress</div>
      <div className="card">
        <div className="focus-row" style={{ alignItems: 'baseline' }}>
          <span className="focus-title">Still reviewing</span>
          <span className="score-big" style={{ fontSize: 24 }}>
            {s.stillReviewing}
          </span>
        </div>
        <p className="text-sm muted" style={{ margin: '6px 0 0', lineHeight: 1.5 }}>
          Missed questions waiting in your review list. Clear them with Retry
          Missed Questions from the Review tab.
        </p>
      </div>

      <p
        className="text-sm muted"
        style={{ textAlign: 'center', margin: '2px 4px 0', lineHeight: 1.5 }}
      >
        Stats are saved on this device only.
      </p>
    </>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="mini-stat">
      <span className="mini-stat-value">{value}</span>
      <span className="mini-stat-label">{label}</span>
    </div>
  )
}

function ScoreCard({ t }: { t: TopicStat }) {
  // Bar color = deterministic topic IDENTITY (bright palette). Performance is
  // carried by the accuracy %, the correct/attempted count, and the bar width.
  return (
    <div className={`card score-card tc-${topicColorIndex(t.topicId)}`}>
      <div className="score-head">
        <span className="score-title">{t.title}</span>
        <span className="score-acc">{t.accuracy}%</span>
      </div>
      <div className="score-count">
        {t.correct} / {t.attempted} correct
      </div>
      <div className="perf-bar">
        <span className="perf-fill" style={{ width: `${Math.max(t.accuracy, 3)}%` }} />
      </div>
    </div>
  )
}

function AccuracyRing({ value, band }: { value: number; band: PerfBand }) {
  const r = 52
  const c = 2 * Math.PI * r
  const offset = c * (1 - Math.max(0, Math.min(100, value)) / 100)
  const stroke =
    band === 'strong'
      ? 'var(--success)'
      : band === 'ok'
        ? 'var(--warning)'
        : band === 'weak'
          ? 'var(--error)'
          : 'var(--faint)'
  return (
    <svg
      className="stat-ring"
      viewBox="0 0 120 120"
      role="img"
      aria-label={`Overall accuracy ${value} percent`}
    >
      <circle className="stat-ring-track" cx="60" cy="60" r={r} />
      <circle
        className="stat-ring-arc"
        cx="60"
        cy="60"
        r={r}
        stroke={stroke}
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform="rotate(-90 60 60)"
      />
      <text className="stat-ring-num" x="60" y="58">
        {value}%
      </text>
      <text className="stat-ring-cap" x="60" y="76">
        accuracy
      </text>
    </svg>
  )
}
