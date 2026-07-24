import type { Question } from '../types'

interface SourceCardProps {
  question: Question
}

/**
 * Shows ONLY citation metadata + an optional official link.
 * No source body text or copyrighted content is ever displayed.
 */
export function SourceCard({ question }: SourceCardProps) {
  // Prefer the structured citation; fall back to the flat source* fields.
  const source = question.citation?.source ?? question.sourceTitle
  const year = question.citation?.year ?? question.sourceYear
  const section = question.citation?.section ?? question.sourceSection
  const url = (question.citation?.url ?? question.officialUrl ?? '').trim()
  const linkLabel = 'View official source'

  return (
    <div className="card" style={{ background: 'var(--surface-2)' }}>
      <div className="section-label" style={{ margin: '0 0 8px' }}>
        Source
      </div>
      <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 14.5, lineHeight: 1.35 }}>
        {source}
      </p>
      {(year || section) && (
        <p className="text-sm muted" style={{ margin: '0 0 10px' }}>
          {year}
          {section ? `${year ? ' · ' : ''}${section}` : ''}
        </p>
      )}
      {url && (
        <a
          className="source-cta"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {linkLabel} ↗
        </a>
      )}
    </div>
  )
}
