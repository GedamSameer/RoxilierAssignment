import React, { useEffect, useState } from 'react'
import { api } from '../api'
import { getToken } from '../auth'
import './owner.css' // 👈 add this

export default function OwnerDashboard() {
  const [data, setData] = useState(null)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  async function load() {
    try {
      setLoading(true)
      setErr('')
      const res = await api('/api/owner/dashboard', { token: getToken() })
      setData(res)
    } catch(e) {
      setErr(e.message || 'Failed to load owner dashboard.')
    } finally {
      setLoading(false)
    }
  }
  useEffect(()=>{ load() }, [])

  return (
    <div className="owner-page">
      <div className="owner-header">
        <h2>Owner Dashboard</h2>
        <p className="sub">See your stores, average ratings, and who rated you.</p>
      </div>

      {err && <div className="error-banner">{err}</div>}

      {!data ? (
        <div className="loading">{loading ? 'Loading…' : 'No data yet.'}</div>
      ) : (
        <div className="grid">
          {/* My Stores */}
          <section className="card">
            <div className="card-head">
              <h3>My Stores</h3>
              <div className="count">Total Stores: {data.stores?.length ?? 0}</div>
            </div>
            {(!data.stores || data.stores.length === 0) ? (
              <div className="empty">You don’t own any stores yet.</div>
            ) : (
              <ul className="list">
                {data.stores.map(s => (
                  <li key={s.id} className="list-item">
                    <span className="dot" />
                    <div className="store-info">
                      <div className="name">{s.name}</div>
                      {s.address ? <div className="muted">{s.address}</div> : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Average Ratings */}
          <section className="card">
            <div className="card-head">
              <h3>Average Ratings</h3>
            </div>
            {(!data.averages || data.averages.length === 0) ? (
              <div className="empty">No ratings yet.</div>
            ) : (
              <ul className="list">
                {data.averages.map(a => {
                  const store = data.stores.find(s => s.id === a.storeId)
                  return (
                    <li key={a.storeId} className="list-item between">
                      <div className="name">{store?.name || '—'}</div>
                      <span className="badge">{Number(a.avgRating).toFixed(2)}</span>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          {/* Who Rated */}
          <section className="card wide">
            <div className="card-head">
              <h3>Who Rated</h3>
              <div className="count">Total Ratings: {data.ratings?.length ?? 0}</div>
            </div>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Store</th>
                    <th>User</th>
                    <th>Email</th>
                    <th className="num">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {(!data.ratings || data.ratings.length === 0) ? (
                    <tr><td className="empty" colSpan="4">No ratings yet.</td></tr>
                  ) : (
                    data.ratings.map(r => (
                      <tr key={r.id}>
                        <td>{r.storeName}</td>
                        <td>{r.userName}</td>
                        <td className="muted">{r.userEmail}</td>
                        <td className="num"><span className="badge">{r.rating}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
