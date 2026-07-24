import { useState } from 'react'
import { AppHeader } from '../components/AppHeader'
import { Icon } from '../components/Icon'
import {
  getBookmarks,
  getIncorrect,
  clearAllLocalProgress,
} from '../lib/storage'

/**
 * Local Study Profile / About screen.
 * On-device only: study progress is stored in localStorage; there are no
 * external services. Shows local progress plus the educational disclaimer
 * and privacy note.
 */
export function ProfileScreen({ onOpenAbbreviations }: { onOpenAbbreviations: () => void }) {
  const [incorrect, setIncorrect] = useState(() => getIncorrect().length)
  const [bookmarks, setBookmarks] = useState(() => getBookmarks().length)
  const [confirming, setConfirming] = useState(false)
  const [cleared, setCleared] = useState(false)

  function clearProgress() {
    clearAllLocalProgress()
    setIncorrect(0)
    setBookmarks(0)
    setConfirming(false)
    setCleared(true)
  }

  return (
    <div className="screen" style={{ paddingTop: 0 }}>
      <AppHeader title="Study Profile" />
      <div className="scroll-area">
        {/* Local-only header */}
        <div className="card">
          <div className="section-label" style={{ margin: '0 0 6px' }}>
            Local progress only
          </div>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>
            Your quiz progress is saved on this device only. No account is
            required.
          </p>
        </div>

        {/* Reference: abbreviations glossary */}
        <button className="link-card" onClick={onOpenAbbreviations}>
          <span className="lc-icon">
            <Icon name="search" size={22} />
          </span>
          <span className="lc-body">
            <span className="lc-title">Abbreviations</span>
            <span className="lc-meta">Search hepatology abbreviations</span>
          </span>
          <span className="lc-chev">
            <Icon name="chevron-right" size={18} />
          </span>
        </button>

        {/* On-device progress */}
        <div className="card">
          <div className="section-label" style={{ margin: '0 0 10px' }}>
            On this device
          </div>
          <div className="grid-2">
            <div style={{ background: 'var(--error-tint)', borderRadius: 'var(--r-md)', padding: '12px 8px', textAlign: 'center' }}>
              <div style={{ color: 'var(--error)', fontWeight: 800, fontSize: 24 }}>{incorrect}</div>
              <div className="text-sm muted">Incorrect to review</div>
            </div>
            <div style={{ background: 'var(--primary-tint)', borderRadius: 'var(--r-md)', padding: '12px 8px', textAlign: 'center' }}>
              <div style={{ color: 'var(--primary)', fontWeight: 800, fontSize: 24 }}>{bookmarks}</div>
              <div className="text-sm muted">Bookmarked</div>
            </div>
          </div>

          {!confirming ? (
            <button
              className="btn btn-secondary"
              style={{ marginTop: 12 }}
              disabled={incorrect === 0 && bookmarks === 0}
              onClick={() => { setConfirming(true); setCleared(false) }}
            >
              Clear local progress
            </button>
          ) : (
            <div style={{ marginTop: 12 }}>
              <p className="text-sm" style={{ margin: '0 0 8px', color: 'var(--text)' }}>
                This permanently clears saved answers, incorrect items, and
                bookmarks on this device. This cannot be undone.
              </p>
              <div className="grid-2">
                <button className="btn btn-ghost" onClick={() => setConfirming(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={clearProgress}>
                  Clear
                </button>
              </div>
            </div>
          )}
          {cleared && (
            <p className="text-sm muted" style={{ margin: '10px 0 0', textAlign: 'center' }}>
              Local progress cleared.
            </p>
          )}
        </div>

        {/* About / Disclaimer */}
        <div className="card">
          <div className="section-label" style={{ margin: '0 0 8px' }}>
            About &amp; disclaimer
          </div>
          <p style={{ margin: '0 0 10px', fontSize: 14.5, lineHeight: 1.55 }}>
            LiverQ is an independent educational quiz app for hepatology learning
            and guideline review. It is intended for study and self-assessment
            only. LiverQ is not a medical device and does not diagnose, treat,
            cure, or prevent any medical condition. It is not intended for
            clinical decision-making or patient-specific medical advice.
          </p>
          <p style={{ margin: '0 0 10px', fontSize: 14.5, lineHeight: 1.55 }}>
            It is designed for clinicians, trainees, residents, advanced practice
            providers, and hepatology learners — not for patients. LiverQ is not
            affiliated with, sponsored by, or endorsed by AASLD; guideline
            references are provided for educational citation only.
          </p>
          <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.55, fontWeight: 600 }}>
            Always refer to the original guideline documents and current clinical
            standards when making patient-care decisions.
          </p>
        </div>

        {/* Privacy */}
        <div className="card" style={{ background: 'var(--surface-2)' }}>
          <div className="section-label" style={{ margin: '0 0 8px' }}>
            Privacy
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.55 }}>
            <li>This version stores quiz progress locally on your device.</li>
            <li>No account is required.</li>
            <li>
              Do not enter patient identifiers or protected health information
              into this app.
            </li>
            <li>
              See the full <a className="source-link" href="/privacy.html" target="_blank" rel="noopener noreferrer">Privacy Policy</a> for details.
            </li>
          </ul>
        </div>

        {/* Footer: legal links */}
        <p className="text-sm muted" style={{ textAlign: 'center', margin: '4px 4px 0' }}>
          <a className="source-link" href="/privacy.html" target="_blank" rel="noopener noreferrer">
            Privacy Policy
          </a>
          {'  ·  '}
          <a className="source-link" href="/terms.html" target="_blank" rel="noopener noreferrer">
            Terms of Use
          </a>
        </p>
      </div>
    </div>
  )
}
