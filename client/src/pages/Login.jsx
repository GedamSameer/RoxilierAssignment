import React, { useState } from 'react'
import { api } from '../api'
import { saveAuth } from '../auth'
import { useNavigate } from 'react-router-dom'
import './auth.css' // 👈 Import styles

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@demo.com')
  const [password, setPassword] = useState('Admin@123')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setErr('')
    setLoading(true)
    try {
      const res = await api('/api/auth/login', {
        method: 'POST',
        body: { email, password }
      })
      saveAuth(res)
      navigate('/stores')
    } catch (e) {
      setErr(e.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Login</h2>

        {err && <div className="auth-error">{err}</div>}

        <form onSubmit={submit} className="auth-form">
          <label>Email</label>
          <input
            placeholder="Enter your email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            placeholder="Enter your password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-footer">
          Don’t have an account?{' '}
          <span
            className="auth-link"
            onClick={() => navigate('/signup')}
          >
            Sign up here
          </span>
        </p>
      </div>
    </div>
  )
}
