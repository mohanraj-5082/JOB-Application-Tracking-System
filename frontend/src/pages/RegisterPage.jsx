import { ArrowLeft, BriefcaseBusiness, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getApiErrorMessage } from '../utils/errorMessage.js'

function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setSubmitting(true)
    try {
      await register({ email: form.email, password: form.password })
      navigate('/', { replace: true })
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Unable to create your account. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-brand"><span className="brand-mark"><BriefcaseBusiness size={19} /></span><span>Job Tracker</span></div>
        <p className="section-kicker">Get started</p>
        <h1>Create your workspace</h1>
        <p className="auth-description">Start tracking applications with a private account.</p>
        {error && <div className="form-alert" role="alert">{error}</div>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="form-field" htmlFor="register-email"><span>Email</span><input id="register-email" type="email" autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></label>
          <label className="form-field" htmlFor="register-password"><span>Password</span><input id="register-password" type="password" autoComplete="new-password" minLength="8" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required /></label>
          <label className="form-field" htmlFor="register-confirm-password"><span>Confirm password</span><input id="register-confirm-password" type="password" autoComplete="new-password" minLength="8" value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} required /></label>
          <button className="primary-button auth-submit" type="submit" disabled={submitting}><UserPlus size={16} />{submitting ? 'Creating account...' : 'Create account'}</button>
        </form>
        <p className="auth-switch"><Link to="/login"><ArrowLeft size={14} /> Back to sign in</Link></p>
      </section>
    </main>
  )
}

export default RegisterPage
