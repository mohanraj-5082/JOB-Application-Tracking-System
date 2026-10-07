import { useEffect, useState } from 'react'

const statuses = ['APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED']
const emptyJob = { companyName: '', jobTitle: '', status: '', applicationDate: '' }

function JobForm({ mode, job, onSubmit, onCancel }) {
  const [form, setForm] = useState(emptyJob)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setForm(job ? {
      companyName: job.companyName ?? '',
      jobTitle: job.jobTitle ?? '',
      status: job.status ?? '',
      applicationDate: job.applicationDate ?? '',
    } : emptyJob)
    setErrors({})
    setSubmitError('')
  }, [job])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = {}
    if (!form.companyName.trim()) nextErrors.companyName = 'Company name is required.'
    if (!form.jobTitle.trim()) nextErrors.jobTitle = 'Job title is required.'
    if (!form.status) nextErrors.status = 'Status is required.'
    if (!form.applicationDate) nextErrors.applicationDate = 'Application date is required.'
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setSubmitting(true)
    setSubmitError('')
    try {
      await onSubmit({ ...form, companyName: form.companyName.trim(), jobTitle: form.jobTitle.trim() })
    } catch (error) {
      setSubmitError(error.message || 'Unable to save this job. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="job-form" onSubmit={handleSubmit}>
      {submitError && <div className="form-alert" role="alert">{submitError}</div>}
      <div className="form-grid">
        <label className="form-field" htmlFor="company-name">
          <span>Company name</span>
          <input id="company-name" name="companyName" value={form.companyName} onChange={handleChange} placeholder="e.g. Google" autoFocus aria-invalid={Boolean(errors.companyName)} aria-describedby={errors.companyName ? 'company-name-error' : undefined} />
          {errors.companyName && <small id="company-name-error">{errors.companyName}</small>}
        </label>
        <label className="form-field" htmlFor="job-title">
          <span>Job title</span>
          <input id="job-title" name="jobTitle" value={form.jobTitle} onChange={handleChange} placeholder="e.g. Software Engineer" aria-invalid={Boolean(errors.jobTitle)} aria-describedby={errors.jobTitle ? 'job-title-error' : undefined} />
          {errors.jobTitle && <small id="job-title-error">{errors.jobTitle}</small>}
        </label>
        <label className="form-field" htmlFor="job-status">
          <span>Status</span>
          <select id="job-status" name="status" value={form.status} onChange={handleChange} aria-invalid={Boolean(errors.status)} aria-describedby={errors.status ? 'job-status-error' : undefined}>
            <option value="">Select a status</option>
            {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
          {errors.status && <small id="job-status-error">{errors.status}</small>}
        </label>
        <label className="form-field" htmlFor="application-date">
          <span>Application date</span>
          <input id="application-date" type="date" name="applicationDate" value={form.applicationDate} onChange={handleChange} aria-invalid={Boolean(errors.applicationDate)} aria-describedby={errors.applicationDate ? 'application-date-error' : undefined} />
          {errors.applicationDate && <small id="application-date-error">{errors.applicationDate}</small>}
        </label>
      </div>
      <div className="modal-actions">
        <button className="secondary-button" type="button" onClick={onCancel} disabled={submitting}>Cancel</button>
        <button className="primary-button" type="submit" disabled={submitting}>{submitting ? 'Saving...' : mode === 'edit' ? 'Save changes' : 'Create job'}</button>
      </div>
    </form>
  )
}

export default JobForm
