import api from './api.js'

export async function getJobs({ search, status, fromDate, toDate, page, size, sort } = {}) {
  const params = {}
  if (search?.trim()) params.search = search.trim()
  if (status) params.status = status
  if (fromDate) params.fromDate = fromDate
  if (toDate) params.toDate = toDate
  if (typeof page === 'number') params.page = page
  if (typeof size === 'number') params.size = size
  if (sort) params.sort = sort

  const response = await api.get('/api/jobs', { params })
  return response.data
}

export async function getJobById(id) {
  const response = await api.get(`/api/jobs/${id}`)
  return response.data
}

export async function createJob(job) {
  const response = await api.post('/api/jobs', job)
  return response.data
}

export async function updateJob(id, job) {
  const response = await api.put(`/api/jobs/${id}`, job)
  return response.data
}

export async function deleteJob(id) {
  await api.delete(`/api/jobs/${id}`)
}
