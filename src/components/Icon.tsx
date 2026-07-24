// ============================================================
// LiverQ — inline SVG line icons.
// Simple, monochrome, stroke-based (uses currentColor), so they
// inherit text color and stay crisp. No external icon library.
// ============================================================

export type IconName =
  | 'home'
  | 'topics'
  | 'review'
  | 'stats'
  | 'study'
  | 'bookmark'
  | 'incorrect'
  | 'chevron-right'
  | 'search'
  | 'menu'

interface IconProps {
  name: IconName
  size?: number
  className?: string
}

// Stroke paths keyed by name. Drawn on a 24x24 grid.
const PATHS: Record<IconName, React.ReactNode> = {
  home: (
    <>
      <path d="M4 11.5 12 5l8 6.5" />
      <path d="M6 10v9h12v-9" />
    </>
  ),
  topics: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </>
  ),
  review: (
    <>
      <path d="M20 11a8 8 0 1 0-.6 3" />
      <path d="M20 5v6h-6" />
    </>
  ),
  stats: (
    <>
      <path d="M5 20V10" />
      <path d="M12 20V4" />
      <path d="M19 20v-7" />
    </>
  ),
  study: (
    <>
      <path d="M4 5.5A2 2 0 0 1 6 4h6v15H6a2 2 0 0 0-2 2z" />
      <path d="M20 5.5A2 2 0 0 0 18 4h-6v15h6a2 2 0 0 1 2 2z" />
    </>
  ),
  bookmark: <path d="M7 4h10v16l-5-3.5L7 20z" />,
  incorrect: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9 9l6 6M15 9l-6 6" />
    </>
  ),
  'chevron-right': <path d="M9 6l6 6-6 6" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M20 20l-4-4" />
    </>
  ),
  menu: (
    <>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </>
  ),
}

export function Icon({ name, size = 22, className }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {PATHS[name]}
    </svg>
  )
}
