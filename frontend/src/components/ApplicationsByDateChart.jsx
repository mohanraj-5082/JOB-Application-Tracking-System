function ApplicationsByDateChart({ jobs }) {
  const grouped = jobs.reduce((months, job) => {
    if (!job.applicationDate) return months
    const month = job.applicationDate.slice(0, 7)
    months[month] = (months[month] ?? 0) + 1
    return months
  }, {})
  const points = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).slice(-6)
  const max = Math.max(...points.map(([, count]) => count), 1)

  if (points.length === 0) {
    return <div className="chart-empty">Application dates will appear here once jobs are added.</div>
  }

  return (
    <div className="date-chart" role="img" aria-label="Applications by month">
      <div className="date-chart-bars">
        {points.map(([month, count]) => (
          <div className="date-chart-column" key={month}>
            <span className="date-chart-count">{count}</span>
            <div className="date-chart-bar-track"><span className="date-chart-bar" style={{ height: `${Math.max((count / max) * 100, 5)}%` }} /></div>
            <span className="date-chart-label">{new Intl.DateTimeFormat('en-US', { month: 'short' }).format(new Date(`${month}-01`))}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ApplicationsByDateChart
