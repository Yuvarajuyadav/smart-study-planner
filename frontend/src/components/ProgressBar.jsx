export default function ProgressBar({ value, label, showLabel = true }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0))
  const color = pct >= 70 ? 'var(--success)' : pct >= 40 ? 'var(--warning)' : 'var(--danger)'
  return (
    <div>
      {showLabel && (
        <div className="progress-label">
          <span>{label || 'Progress'}</span>
          <span style={{ color }}>{pct}%</span>
        </div>
      )}
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}
