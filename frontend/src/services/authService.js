import api from './api.js'

const TOKEN_KEY = 'job_tracker_access_token'
const USER_KEY = 'job_tracker_user'

export async function register(credentials) {
  const { data } = await api.post('/api/auth/register', credentials)
  return persistAuth(data)
}

export async function login(credentials) {
  const { data } = await api.post('/api/auth/login', credentials)
  return persistAuth(data)
}

export function getStoredToken() {
  return sessionStorage.getItem(TOKEN_KEY)
}

export function getStoredUser() {
  const storedUser = sessionStorage.getItem(USER_KEY)
  try {
    return storedUser ? JSON.parse(storedUser) : null
  } catch {
    clearAuth()
    return null
  }
}

export function clearAuth() {
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(USER_KEY)
}

function persistAuth(authResponse) {
  sessionStorage.setItem(TOKEN_KEY, authResponse.token)
  const user = { email: authResponse.email, expiresAt: Date.now() + authResponse.expiresIn }
  sessionStorage.setItem(USER_KEY, JSON.stringify(user))
  return user
}
