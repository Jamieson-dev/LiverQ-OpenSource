import { useMemo, useState } from 'react'
import { AppHeader } from '../components/AppHeader'
import { Icon } from '../components/Icon'
import { searchAbbreviations } from '../lib/abbreviations'

/**
 * Abbreviations glossary — a simple, local, searchable reference.
 * Reached from the Study section. Shows ONLY abbreviation + full term; no
 * sources, topics, citations, or explanations. No network, no storage.
 */
export function AbbreviationsScreen({ onBack }: { onBack: () => void }) {
  const [query, setQuery] = useState('')
  const results = useMemo(() => searchAbbreviations(query), [query])
  const searching = query.trim().length > 0

  return (
    <div className="screen screen-abbr" style={{ paddingTop: 0 }}>
      <AppHeader title="Abbreviations" onBack={onBack} backLabel="Back to Study" />

      <div className="abbr-search">
        <div className="search">
          <Icon name="search" size={18} />
          <input
            type="search"
            inputMode="search"
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="Search abbreviations or full terms"
            aria-label="Search abbreviations or full terms"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {searching && (
            <button className="abbr-clear" onClick={() => setQuery('')} aria-label="Clear search">
              ✕
            </button>
          )}
        </div>
        {searching && (
          <div className="abbr-count" aria-live="polite">
            {results.length} result{results.length === 1 ? '' : 's'}
          </div>
        )}
      </div>

      <div className="scroll-area abbr-list" role="list" aria-label="Abbreviations">
        {results.length === 0 ? (
          <div className="empty-state">
            <div className="emoji" aria-hidden>🔍</div>
            <p>No abbreviations match “{query}”</p>
          </div>
        ) : (
          results.map((a) => (
            <div className="abbr-row" role="listitem" key={a.abbreviation}>
              <div className="abbr-term">{a.abbreviation}</div>
              <div className="abbr-full">{a.fullName}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
