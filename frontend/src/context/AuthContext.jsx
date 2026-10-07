import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { clearAuth, getStoredToken, getStoredUser, login as loginRequest, register as registerRequest } from '../services/authService.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredToken() ? getStoredUser() : null)

  useEffect(() => {
    function handleUnauthorized() {
      clearAuth()
      setUser(null)
    }

    window.addEventListener('auth:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized)
  }, [])

  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user && getStoredToken()),
    async login(credentials) {
      const authenticatedUser = await loginRequest(credentials)
      setUser(authenticatedUser)
      return authenticatedUser
    },
    async register(credentials) {
      const authenticatedUser = await registerRequest(credentials)
      setUser(authenticatedUser)
      return authenticatedUser
    },
    logout() {
      clearAuth()
      setUser(null)
    },
  }), [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
