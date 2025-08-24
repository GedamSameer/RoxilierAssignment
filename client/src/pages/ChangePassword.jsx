import React, { useState } from 'react'
import { api } from '../api'
import { getToken } from '../auth'
import './auth.css' // 👈 reuse the same styles

export default function ChangePassword() {
  const [newPassword, setNewPassword] = useState('NewPass@123')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e){
    e.preventDefault()
    setMsg(''); setErr(''); setLoading(true)
    try {
      await api('/api/auth/change-password', {
        method: 'POST',
        token: getToken(),
        body: { newPassword }
      })
      setMsg('Password updated.')
    } catch(e) {
      setErr(e.message || 'Failed to update password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Change Password</h2>

        {msg && <div className="auth-success">{msg}</div>}
        {err && <div className="auth-error">{err}</div>}

        <form onSubmit={submit} className="auth-form">
          <label>New Password (8–16, 1 uppercase, 1 special)</label>
          <input
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={e=>setNewPassword(e.target.value)}
            required
          />

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
