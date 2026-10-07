import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, FilterX, Plus, RefreshCw, Search } from 'lucide-react'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import EmptyState from '../components/EmptyState.jsx'
import JobForm from '../components/JobForm.jsx'
import JobModal from '../components/JobModal.jsx'
import JobTable from '../components/JobTable.jsx'
import LoadingState from '../components/LoadingState.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { createJob, deleteJob, getJobs, updateJob } from '../services/jobService.js'
import { getApiErrorMessage } from '../utils/errorMessage.js'

const PAGE_SIZE = 5
const initialFilters = { search: '', status: '', fromDate: '', toDate: '' }

function JobsPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [modal, setModal] = useState(null)
  const [confirmJob, setConfirmJob] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [filters, setFilters] = useState(initialFilters)
  const [draftFilters, setDraftFilters] = useState(initialFilters)
  const [page, setPage] = useState(0)
  const [sortField, setSortField] = useState('applicationDate')
  const [sortDirection, setSortDirection] = useState('desc')

  const loadJobs = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getJobs({
        ...filters,
        page,
        size: PAGE_SIZE,
        sort: `${sortField},${sortDirection}`,
      })
      setJobs(Array.isArray(data) ? data : [])
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Unable to load jobs. Please try again.'))
      setJobs([])
    } finally {
      setLoading(false)
    }
  }, [filters, page, sortField, sortDirection])

  useEffect(() => { loadJobs() }, [loadJobs])

  function updateDraft(event) {
    const { name, value } = event.target
    setDraftFilters((current) => ({ ...current, [name]: value }))
  }

  function applyFilters(event) {
    event.preventDefault()
    setFilters({ ...draftFilters, search: draftFilters.search.trim() })
    setPage(0)
  }

  function clearFilters() {
    setDraftFilters(initialFilters)
    setFilters(initialFilters)
    setPage(0)
  }

  function handleSort(field) {
    if (sortField === field) {
      setSortDirection((current) => current === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
    setPage(0)
  }

  function openCreate() { setModal({ type: 'create', job: null }) }
  function openEdit(job) { setModal({ type: 'edit', job }) }
  function openView(job) { setModal({ type: 'view', job }) }

  async function handleSave(jobData) {
    try {
      if (modal.type === 'edit') {
        await updateJob(modal.job.id, jobData)
        setFeedback({ type: 'success', message: 'Job updated successfully.' })
      } else {
        await createJob(jobData)
        setFeedback({ type: 'success', message: 'Job created successfully.' })
      }
      setModal(null)
      await loadJobs()
    } catch (requestError) {
      throw new Error(getApiErrorMessage(requestError, `Unable to ${modal.type === 'edit' ? 'update' : 'create'} this job. Please try again.`))
    }
  }

  async function handleDelete() {
    if (!confirmJob) return
    setDeleting(true)
    try {
      await deleteJob(confirmJob.id)
      setConfirmJob(null)
      setFeedback({ type: 'success', message: 'Job deleted successfully.' })
      if (jobs.length === 1 && page > 0) setPage((current) => current - 1)
      else await loadJobs()
    } catch (requestError) {
      setConfirmJob(null)
      setFeedback({ type: 'error', message: getApiErrorMessage(requestError, 'Unable to delete this job. Please try again.') })
    } finally {
      setDeleting(false)
    }
  }

  const hasNextPage = jobs.length === PAGE_SIZE
  const hasActiveFilters = Object.values(filters).some(Boolean)

  return (
    <div className="page-stack jobs-page">
      <section className="page-heading-row">
        <div>
          <p className="section-kicker">Workspace</p>
          <h1>Jobs</h1>
          <p className="section-description">Keep every application, conversation, and opportunity organized.</p>
        </div>
        <button className="primary-button" type="button" onClick={openCreate}><Plus size={18} /> Add job</button>
      </section>

      {feedback && <div className={`feedback-banner feedback-banner--${feedback.type}`} role="status">{feedback.message}<button type="button" onClick={() => setFeedback(null)} aria-label="Dismiss message">×</button></div>}

      <form className="jobs-filters" onSubmit={applyFilters}>
        <div className="search-field">
          <Search size={17} aria-hidden="true" />
          <input name="search" value={draftFilters.search} onChange={updateDraft} placeholder="Search company or job title" aria-label="Search company or job title" />
        </div>
        <select name="status" value={draftFilters.status} onChange={updateDraft} aria-label="Filter by status">
          <option value="">All statuses</option>
          <option value="APPLIED">Applied</option>
          <option value="INTERVIEW">Interview</option>
          <option value="OFFER">Offer</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <label className="date-filter"><span>From</span><input type="date" name="fromDate" value={draftFilters.fromDate} onChange={updateDraft} aria-label="From date" /></label>
        <label className="date-filter"><span>To</span><input type="date" name="toDate" value={draftFilters.toDate} onChange={updateDraft} aria-label="To date" /></label>
        <button className="primary-button filter-submit" type="submit">Apply</button>
        {hasActiveFilters && <button className="filter-clear" type="button" onClick={clearFilters}><FilterX size={15} /> Clear</button>}
      </form>

      <section className="jobs-panel">
        <div className="jobs-panel-header">
          <div><h2>All jobs</h2><p>{jobs.length} {jobs.length === 1 ? 'application' : 'applications'} on this page</p></div>
          {!loading && !error && <button className="secondary-button refresh-button" type="button" onClick={loadJobs}><RefreshCw size={15} /> Refresh</button>}
        </div>
        {loading ? <LoadingState /> : error ? (
          <div className="table-state table-state--error" role="alert"><AlertCircle size={24} /><h2>Unable to load jobs</h2><p>{error}</p><button className="secondary-button" type="button" onClick={loadJobs}>Try again</button></div>
        ) : jobs.length === 0 ? <EmptyState onAdd={openCreate} /> : <JobTable jobs={jobs} onView={openView} onEdit={openEdit} onDelete={setConfirmJob} sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />}
        {!loading && !error && jobs.length > 0 && <div className="pagination-bar"><span>Page {page + 1}</span><div className="pagination-actions"><button className="secondary-button" type="button" disabled={page === 0} onClick={() => setPage((current) => current - 1)}>Previous</button><button className="secondary-button" type="button" disabled={!hasNextPage} onClick={() => setPage((current) => current + 1)}>Next</button></div></div>}
      </section>

      {modal?.type === 'create' && <JobModal title="Add a job" onClose={() => setModal(null)}><JobForm mode="create" onSubmit={handleSave} onCancel={() => setModal(null)} /></JobModal>}
      {modal?.type === 'edit' && <JobModal title="Edit job" onClose={() => setModal(null)}><JobForm mode="edit" job={modal.job} onSubmit={handleSave} onCancel={() => setModal(null)} /></JobModal>}
      {modal?.type === 'view' && <JobModal title="Job details" onClose={() => setModal(null)}><div className="job-details"><div className="job-detail-row"><span>Company</span><strong>{modal.job.companyName}</strong></div><div className="job-detail-row"><span>Job title</span><strong>{modal.job.jobTitle}</strong></div><div className="job-detail-row"><span>Status</span><StatusBadge status={modal.job.status} /></div><div className="job-detail-row"><span>Application date</span><strong>{modal.job.applicationDate}</strong></div><div className="modal-actions"><button className="primary-button" type="button" onClick={() => setModal(null)}>Close</button></div></div></JobModal>}
      {confirmJob && <ConfirmDialog job={confirmJob} onConfirm={handleDelete} onCancel={() => setConfirmJob(null)} deleting={deleting} />}
    </div>
  )
}

export default JobsPage
