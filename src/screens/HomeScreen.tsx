import { HeroCard } from '../components/HeroCard'
import { FooterDisclaimer } from '../components/FooterDisclaimer'
import { Icon } from '../components/Icon'

interface HomeScreenProps {
  selectedTopicCount: number
  approvedQuestionCount: number
  incorrectCount: number
  bookmarkCount: number
  onStartMixedQuiz: () => void
  onChooseTopics: () => void
  onReviewIncorrect: () => void
  onReviewBookmarks: () => void
}

export function HomeScreen({
  selectedTopicCount,
  approvedQuestionCount,
  incorrectCount,
  bookmarkCount,
  onStartMixedQuiz,
  onChooseTopics,
  onReviewIncorrect,
  onReviewBookmarks,
}: HomeScreenProps) {
  const canStart = approvedQuestionCount > 0

  return (
    <div className="screen" style={{ paddingTop: 'calc(var(--s5) + env(safe-area-inset-top))' }}>
      <div className="scroll-area">
        <HeroCard />

        {/* Primary actions */}
        <div className="stack home-cta">
          <button className="btn btn-primary" onClick={onStartMixedQuiz} disabled={!canStart}>
            Start quiz
          </button>
          <button className="btn btn-secondary" onClick={onChooseTopics}>
            Choose topics
          </button>
        </div>

        {/* At-a-glance summary */}
        <div className="grid-2">
          <div className="stat-tile">
            <div className="section-label" style={{ margin: 0 }}>
              Selected topics
            </div>
            <div className="stat-num">{selectedTopicCount}</div>
          </div>
          <div className="stat-tile">
            <div className="section-label" style={{ margin: 0 }}>
              Questions available
            </div>
            <div className="stat-num">{approvedQuestionCount}</div>
          </div>
        </div>

        {/* Review & Learn */}
        <div className="section-label">Review &amp; learn</div>
        <div className="stack-sm">
          <button className="link-card" onClick={onReviewIncorrect}>
            <span className="lc-icon">
              <Icon name="incorrect" size={22} />
            </span>
            <span className="lc-body">
              <span className="lc-title">Incorrect answers</span>
              <span className="lc-meta">{incorrectCount} saved on this device</span>
            </span>
            <span className="lc-chev">
              <Icon name="chevron-right" size={18} />
            </span>
          </button>
          <button className="link-card" onClick={onReviewBookmarks}>
            <span className="lc-icon">
              <Icon name="bookmark" size={22} />
            </span>
            <span className="lc-body">
              <span className="lc-title">Bookmarks</span>
              <span className="lc-meta">{bookmarkCount} saved on this device</span>
            </span>
            <span className="lc-chev">
              <Icon name="chevron-right" size={18} />
            </span>
          </button>
        </div>

        <FooterDisclaimer />
      </div>
    </div>
  )
}
