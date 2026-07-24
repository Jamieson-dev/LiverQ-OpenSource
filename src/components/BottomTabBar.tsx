import type { Screen } from '../types'
import { Icon, type IconName } from './Icon'

export interface TabItem {
  /** The screen this tab activates / highlights for. */
  key: Screen
  label: string
  /** Line-icon name (see Icon component). */
  icon: IconName
  onSelect: () => void
}

interface BottomTabBarProps {
  /** Which tab should appear active for the current screen. */
  active: Screen | null
  items: TabItem[]
}

export function BottomTabBar({ active, items }: BottomTabBarProps) {
  return (
    <nav className="bottom-tabs" aria-label="Primary">
      {items.map((item) => {
        const isActive = item.key === active
        return (
          <button
            key={item.key}
            className={`tab ${isActive ? 'is-active' : ''}`}
            onClick={item.onSelect}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon name={item.icon} size={22} />
            <span className="tab-label">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
