import { useCallback, useMemo, useState } from 'react'
import { AlertCircle, BriefcaseBusiness, CheckCircle2, CircleDollarSign, MessagesSquare, RefreshCw, TrendingUp } from 'lucide-react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import ApplicationsByDateChart from '../components/ApplicationsByDateChart.jsx'
import LoadingState from '../components/LoadingState.jsx'
import RecentApplications from '../components/RecentApplications.jsx'
import StatusDistributionChart from '../components/StatusDistributionChart.jsx'
import { getJobs } from '../services/jobService.js'
import { getApiErrorMessage } from '../utils/errorMessage.js'

const statusConfig = [
  { key: 'APPLIED', label: 'Applied', icon: BriefcaseBusiness, tone: 'blue' },
  { key: 'INTERVIEW', label: 'Interviews', icon: MessagesSquare, tone: 'purple' },
  { key: 'OFFER', label: 'Offers', icon: CircleDollarSign, tone: 'green' },
  { key: 'REJECTED', label: 'Rejected', icon: CheckCircle2, tone: 'orange' },
]

function DashboardPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getJobs({ page: 0, size: 1000, sort: 'applicationDate,desc' })
      setJobs(Array.isArray(data) ? data : [])
    } catch (requestError) {
      setJobs([])
      setError(getApiErrorMessage(requestError, 'Unable to load dashboard data. Please try again.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadDashboard() }, [loadDashboard])

  const counts = useMemo(() => jobs.reduce((summary, job) => {
    summary[job.status] = (summary[job.status] ?? 0) + 1
    return summary
  }, {}), [jobs])

  const recentJobs = useMemo(() => [...jobs].sort((a, b) => (b.applicationDate ?? '').localeCompare(a.applicationDate ?? '')), [jobs])

  if (loading) {
    return <div className="dashboard-loading"><LoadingState label="Loading dashboard..." /></div>
  }

  if (error) {
    return (
      <div className="dashboard-error" role="alert">
        <AlertCircle size={25} />
        <h2>Unable to load dashboard</h2>
        <p>{error}</p>
        <button className="secondary-button" type="button" onClick={loadDashboard}><RefreshCw size={15} /> Try again</button>
      </div>
    )
  }

  return (
    <div className="page-stack dashboard-page">
      <section className="welcome-section">
        <div>
          <p className="section-kicker">Application overview</p>
          <h1>Good morning, welcome back.</h1>
          <p className="section-description">A clear view of your job search, all in one place.</p>
        </div>
        <div className="welcome-accent" aria-hidden="true"><TrendingUp size={28} /></div>
      </section>

      <section className="stats-grid dashboard-stats" aria-label="Application summary">
        <article className="stat-card">
          <div className="stat-icon stat-icon--blue"><BriefcaseBusiness size={19} /></div>
          <p className="stat-label">Total applications</p>
          <div className="stat-value-row"><span className="stat-value">{jobs.length}</span><span className="stat-note">All tracked</span></div>
        </article>
        {statusConfig.map(({ key, label, icon: Icon, tone }) => (
          <article className="stat-card" key={key}>
            <div className={`stat-icon stat-icon--${tone}`}><Icon size={19} /></div>
            <p className="stat-label">{label}</p>
            <div className="stat-value-row"><span className="stat-value">{counts[key] ?? 0}</span><span className="stat-note">Tracked</span></div>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="dashboard-panel status-distribution-panel">
          <div className="dashboard-panel-header"><div><h2>Status distribution</h2><p>How your applications are progressing</p></div><div className="panel-icon panel-icon--small"><TrendingUp size={18} /></div></div>
          <StatusDistributionChart counts={counts} total={jobs.length} />
        </article>
        <article className="dashboard-panel date-distribution-panel">
          <div className="dashboard-panel-header"><div><h2>Applications by date</h2><p>Recent application activity</p></div><div className="panel-icon panel-icon--small"><CalendarIcon /></div></div>
          <ApplicationsByDateChart jobs={jobs} />
        </article>
      </section>

      <section className="dashboard-panel recent-panel">
        <div className="dashboard-panel-header"><div><h2>Recent applications</h2><p>Your latest tracked opportunities</p></div><Link className="panel-link" to="/jobs">View all jobs <span aria-hidden="true">→</span></Link></div>
        <RecentApplications jobs={recentJobs} />
      </section>
    </div>
  )
}

function CalendarIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="4" rx="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
}

export default DashboardPage
