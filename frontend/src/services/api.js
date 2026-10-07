import axios from 'axios'
import { appConfig } from '../config/env.js'

const TOKEN_KEY = 'job_tracker_access_token'

const api = axios.create({
  baseURL: appConfig.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  if (!appConfig.isConfigured) {
    const error = new Error('VITE_API_BASE_URL is not configured.')
    error.code = 'API_BASE_URL_MISSING'
    return Promise.reject(error)
  }

  const token = sessionStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem(TOKEN_KEY)
      sessionStorage.removeItem('job_tracker_user')
      window.dispatchEvent(new Event('auth:unauthorized'))
    }
    return Promise.reject(error)
  },
)

export default api
