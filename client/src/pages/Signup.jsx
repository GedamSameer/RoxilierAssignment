import React, { useState } from 'react'
import { api } from '../api'
import { useNavigate } from 'react-router-dom'
import './auth.css' // 👈 same stylesheet as Login

export default function Signup() {
  const [name, setName] = useState('Normal User Sample XXX YYY')
  const [email, setEmail] = useState('user2@demo.com')
  const [address, setAddress] = useState('Somewhere on Earth')
  const [password, setPassword] = useState('User@1234')
  const [err, setErr] = useState('')
  const [ok, setOk] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function submit(e) {
    e.preventDefault()
    setErr(''); setOk(false); setLoading(true)
    try {
      await api('/api/auth/signup', { method: 'POST', body: { name, email, address, password } })
      setOk(true)
      setTimeout(()=>navigate('/login'), 800)
    } catch(e) {
      setErr(e.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Signup</h2>

        {ok && <div className="auth-success">Signup successful! Please login.</div>}
        {err && <div className="auth-error">{err}</div>}

        <form onSubmit={submit} className="auth-form">
          <label>Full Name (20–60 chars)</label>
          <input
            placeholder="Enter your full name"
            value={name}
            onChange={e=>setName(e.target.value)}
            required
          />

          <label>Email</label>
          <input
            placeholder="Enter your email"
            type="email"
            value={email}
            onChange={e=>setEmail(e.target.value)}
            required
          />

          <label>Address (≤400)</label>
          <input
            placeholder="Enter your address"
            value={address}
            onChange={e=>setAddress(e.target.value)}
            required
          />

          <label>Password (8–16, 1 uppercase, 1 special)</label>
          <input
            placeholder="Create a strong password"
            type="password"
            value={password}
            onChange={e=>setPassword(e.target.value)}
            required
          />

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <span className="auth-link" onClick={()=>navigate('/login')}>
            Login here
          </span>
        </p>
      </div>
    </div>
  )
}
