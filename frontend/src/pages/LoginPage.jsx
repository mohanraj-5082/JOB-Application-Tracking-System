import { BriefcaseBusiness, LogIn } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getApiErrorMessage } from '../utils/errorMessage.js'

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(form)
      navigate(location.state?.from || '/', { replace: true })
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Unable to sign in. Please check your details.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand"><span className="brand-mark"><BriefcaseBusiness size={19} /></span><span>Job Tracker</span></div>
        <p className="section-kicker">Welcome back</p>
        <h1>Sign in to your workspace</h1>
        <p className="auth-description">Keep your applications organized and moving forward.</p>
        {error && <div className="form-alert" role="alert">{error}</div>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="form-field" htmlFor="login-email"><span>Email</span><input id="login-email" type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></label>
          <label className="form-field" htmlFor="login-password"><span>Password</span><input id="login-password" type="password" autoComplete="current-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required /></label>
          <button className="primary-button auth-submit" type="submit" disabled={submitting}><LogIn size={16} />{submitting ? 'Signing in...' : 'Sign in'}</button>
        </form>
        <p className="auth-switch">New to Job Tracker? <Link to="/register">Create an account</Link></p>
      </section>
    </main>
  )
}

export default LoginPage
