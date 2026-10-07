import { AlertTriangle } from 'lucide-react'
import JobModal from './JobModal.jsx'

function ConfirmDialog({ job, onConfirm, onCancel, deleting }) {
  return (
    <JobModal title="Delete job" onClose={onCancel}>
      <div className="confirm-content">
        <div className="confirm-icon"><AlertTriangle size={21} /></div>
        <p>Are you sure you want to delete this job?</p>
        <strong>{job.companyName} · {job.jobTitle}</strong>
        <div className="modal-actions">
          <button className="secondary-button" type="button" onClick={onCancel} disabled={deleting}>Cancel</button>
          <button className="danger-button" type="button" onClick={onConfirm} disabled={deleting}>{deleting ? 'Deleting...' : 'Delete job'}</button>
        </div>
      </div>
    </JobModal>
  )
}

export default ConfirmDialog
