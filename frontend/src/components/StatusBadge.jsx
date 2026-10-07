const statusLabels = {
  APPLIED: 'Applied',
  INTERVIEW: 'Interview',
  OFFER: 'Offer',
  REJECTED: 'Rejected',
}

function StatusBadge({ status }) {
  return <span className={`status-badge status-badge--${status?.toLowerCase()}`}>{statusLabels[status] ?? status}</span>
}

export default StatusBadge
