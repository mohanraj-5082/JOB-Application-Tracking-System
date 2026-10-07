import { ArrowDown, ArrowUp, ChevronsUpDown, Eye, Pencil, Trash2 } from 'lucide-react'
import StatusBadge from './StatusBadge.jsx'

const columns = [
  { label: 'Company', field: 'companyName' },
  { label: 'Job title', field: 'jobTitle' },
  { label: 'Status', field: 'status' },
  { label: 'Application date', field: 'applicationDate' },
]

function JobTable({ jobs, onView, onEdit, onDelete, sortField, sortDirection, onSort }) {
  function sortIcon(field) {
    if (sortField !== field) return <ChevronsUpDown size={13} />
    return sortDirection === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
  }

  return (
    <div className="jobs-table-wrap">
      <table className="jobs-table">
        <thead>
          <tr>
            {columns.map(({ label, field }) => (
              <th scope="col" key={field} aria-sort={sortField === field ? sortDirection === 'asc' ? 'ascending' : 'descending' : 'none'}>
                <button className="sort-button" type="button" aria-label={`Sort by ${label}`} onClick={() => onSort(field)}>{label} {sortIcon(field)}</button>
              </th>
            ))}
            <th scope="col"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <tr key={job.id}>
              <td data-label="Company"><span className="company-name">{job.companyName}</span></td>
              <td data-label="Job title">{job.jobTitle}</td>
              <td data-label="Status"><StatusBadge status={job.status} /></td>
              <td data-label="Application date">{job.applicationDate}</td>
              <td data-label="Actions">
                <div className="table-actions">
                  <button className="table-action" type="button" title="View job" aria-label={`View ${job.jobTitle}`} onClick={() => onView(job)}><Eye size={16} /></button>
                  <button className="table-action" type="button" title="Edit job" aria-label={`Edit ${job.jobTitle}`} onClick={() => onEdit(job)}><Pencil size={16} /></button>
                  <button className="table-action table-action--danger" type="button" title="Delete job" aria-label={`Delete ${job.jobTitle}`} onClick={() => onDelete(job)}><Trash2 size={16} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default JobTable
