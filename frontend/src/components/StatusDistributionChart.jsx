import StatusBadge from './StatusBadge.jsx'

const statuses = ['APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED']

function StatusDistributionChart({ counts, total }) {
  return (
    <div className="status-chart" role="img" aria-label="Status distribution">
      {statuses.map((status) => {
        const count = counts[status] ?? 0
        const percentage = total > 0 ? Math.round((count / total) * 100) : 0
        return (
          <div className="status-chart-row" key={status}>
            <div className="status-chart-label"><StatusBadge status={status} /><span>{count}</span></div>
            <div className="status-chart-track"><span className={`status-chart-fill status-chart-fill--${status.toLowerCase()}`} style={{ width: `${percentage}%` }} /></div>
            <span className="status-chart-percent">{percentage}%</span>
          </div>
        )
      })}
    </div>
  )
}

export default StatusDistributionChart
