import { CalendarDays } from 'lucide-react'
import StatusBadge from './StatusBadge.jsx'

function RecentApplications({ jobs }) {
  if (jobs.length === 0) {
    return <div className="recent-empty">No applications found yet.</div>
  }

  return (
    <div className="recent-list">
      {jobs.slice(0, 5).map((job) => (
        <div className="recent-row" key={job.id}>
          <div className="recent-company-mark">{job.companyName?.charAt(0)?.toUpperCase() ?? '?'}</div>
          <div className="recent-job-info"><strong>{job.jobTitle}</strong><span>{job.companyName}</span></div>
          <StatusBadge status={job.status} />
          <div className="recent-date"><CalendarDays size={14} />{job.applicationDate}</div>
        </div>
      ))}
    </div>
  )
}

export default RecentApplications
