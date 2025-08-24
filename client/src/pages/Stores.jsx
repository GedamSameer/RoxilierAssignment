import React, { useEffect, useState } from 'react'
import { api } from '../api'
import { getToken } from '../auth'
import RatingStars from '../components/RatingStars.jsx'
import './stores.css' // 👈 add this

export default function Stores() {
  const [q, setQ] = useState('')
  const [items, setItems] = useState([])
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  async function load() {
    try {
      setLoading(true)
      setErr('')
      const data = await api(`/api/stores?q=${encodeURIComponent(q)}`, { token: getToken() })
      setItems(data.items)
    } catch(e) {
      setErr(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=>{ load() }, [])

  async function rate(id, value) {
    try {
      await api(`/api/stores/${id}/rate`, { method: 'POST', token: getToken(), body: { rating: value } })
      load()
    } catch(e) { alert(e.message) }
  }

  return (
    <div className="stores-page">
      <div className="stores-header">
        <h2>All Stores</h2>
        <p className="sub">Browse, search, and rate stores on the platform.</p>
      </div>

      <div className="searchbar">
        <input
          className="input"
          value={q}
          onChange={e=>setQ(e.target.value)}
          placeholder="Search by name or address"
        />
        <button className="btn btn-primary" onClick={load} disabled={loading}>
          {loading ? 'Searching…' : 'Search'}
        </button>
      </div>

      {err && <div className="error-banner">{err}</div>}

      <div className="table-card">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Address</th>
                <th className="num">Overall Rating</th>
                <th className="num">My Rating</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty">
                    {loading ? 'Loading…' : 'No stores found. Try a different search.'}
                  </td>
                </tr>
              ) : (
                items.map(it => (
                  <tr key={it.id}>
                    <td>{it.name}</td>
                    <td className="muted">{it.address}</td>
                    <td className="num">
                      {it.overallRating?.toFixed ? (
                        <span className="badge">
                          {it.overallRating.toFixed(2)}
                        </span>
                      ) : (
                        <span className="muted">–</span>
                      )}
                    </td>
                    <td className="num">{it.myRating ?? <span className="muted">–</span>}</td>
                    <td>
                      <div className="rate-control">
                        <RatingStars value={it.myRating} onChange={v=>rate(it.id, v)} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
