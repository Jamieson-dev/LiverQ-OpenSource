interface TeachingPearlCardProps {
  pearl: string
}

/**
 * Optional high-yield takeaway shown after answering. Calm accent styling
 * (light teal) so it reads as a helpful note, not an alert.
 */
export function TeachingPearlCard({ pearl }: TeachingPearlCardProps) {
  return (
    <div
      className="card"
      style={{ background: 'var(--primary-tint)', borderColor: '#cfe3df' }}
    >
      <div
        className="section-label"
        style={{ margin: '0 0 6px', color: 'var(--primary)' }}
      >
        Teaching pearl
      </div>
      <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.5 }}>{pearl}</p>
    </div>
  )
}
