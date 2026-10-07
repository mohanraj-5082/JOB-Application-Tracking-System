import { BriefcaseBusiness, Plus } from 'lucide-react'

function EmptyState({ onAdd }) {
  return (
    <div className="table-state table-state--empty">
      <div className="empty-state-icon"><BriefcaseBusiness size={24} /></div>
      <h2>No jobs found</h2>
      <p>Start building your pipeline by adding your first job application.</p>
      <button className="primary-button" type="button" onClick={onAdd}>
        <Plus size={17} /> Add job
      </button>
    </div>
  )
}

export default EmptyState
