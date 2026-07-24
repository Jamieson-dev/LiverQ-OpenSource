interface AppHeaderProps {
  title?: string
  /** Show a back/chevron button on the left. */
  onBack?: () => void
  /** Accessible label for the back button (default "Go back"). */
  backLabel?: string
  /** Glyph for the back button (default chevron). Quiz passes ✕ for "exit". */
  backIcon?: string
  /** Optional right-side slot (e.g. a bookmark toggle). */
  right?: React.ReactNode
}

export function AppHeader({ title, onBack, backLabel = 'Go back', backIcon = '‹', right }: AppHeaderProps) {
  return (
    <header className="app-header">
      {onBack && (
        <button className="icon-btn" onClick={onBack} aria-label={backLabel}>
          {backIcon}
        </button>
      )}
      {title && <div className="title">{title}</div>}
      {right && <div style={{ marginLeft: 'auto' }}>{right}</div>}
    </header>
  )
}
