import React, { useEffect, useMemo, useState } from 'react'
import { api } from '../api'
import { getToken } from '../auth'
import './admin.css' // 👈 add this

/** ---------- Reusable Modal (memoized) ---------- */
const Modal = React.memo(function Modal({ open, title, onClose, children }) {
  if (!open) return null
  return (
    <div role="dialog" aria-modal="true" className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e)=>e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="btn btn-ghost" onClick={onClose} aria-label="Close">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
})

/** ---------- Create User Modal (isolated state + memoized) ---------- */
const CreateUserModal = React.memo(function CreateUserModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({ name:'', email:'', address:'', password:'', role:'USER' })
  const [msg, setMsg] = useState({ ok:'', err:'' })

  React.useEffect(()=>{ if(open){ setForm({ name:'', email:'', address:'', password:'', role:'USER' }); setMsg({ok:'',err:''}) } }, [open])

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim())
  const validate = () => {
    const { name, email, address, password, role } = form
    if (!name || name.trim().length < 20 || name.trim().length > 60) return 'Name must be 20–60 characters.'
    if (!isValidEmail(email)) return 'Invalid email.'
    if (address && address.length > 400) return 'Address max 400 characters.'
    if (!password || password.length < 8 || password.length > 16) return 'Password must be 8–16 characters.'
    if (!/[A-Z]/.test(password) || !/[!@#$%^&*(),.?":{}|<>_\-+=]/.test(password)) return 'Password must include at least one uppercase and one special character.'
    if (!['USER','ADMIN','OWNER'].includes(role)) return 'Role must be USER, ADMIN, or OWNER.'
    return ''
  }

  async function submit(e){
    e.preventDefault()
    setMsg({ok:'', err:''})
    const err = validate()
    if (err) return setMsg({ok:'', err})
    try {
      await api('/api/admin/users', {
        method: 'POST', token: getToken(),
        body: {
          name: form.name.trim(),
          email: form.email.trim(),
          address: form.address.trim(),
          password: form.password,
          role: form.role
        }
      })
      setMsg({ ok:'User created successfully.', err:'' })
      onCreated?.()
      setTimeout(onClose, 450)
    } catch(e){ setMsg({ok:'', err: e.message}) }
  }

  return (
    <Modal open={open} title="Create New User" onClose={onClose}>
      {msg.err && <div className="banner error">{msg.err}</div>}
      {msg.ok && <div className="banner success">{msg.ok}</div>}
      <form onSubmit={submit} className="form-grid">
        <label>Full Name (20–60 chars)</label>
        <input value={form.name} onChange={e=>setForm(f=>({...f, name:e.target.value}))} placeholder="e.g., Jonathan Alexander Carter" />

        <label>Email</label>
        <input value={form.email} onChange={e=>setForm(f=>({...f, email:e.target.value}))} placeholder="name@example.com" />

        <label>Address (≤400)</label>
        <input value={form.address} onChange={e=>setForm(f=>({...f, address:e.target.value}))} placeholder="Street, City, State" />

        <label>Password (8–16, 1 uppercase, 1 special)</label>
        <input type="password" value={form.password} onChange={e=>setForm(f=>({...f, password:e.target.value}))} placeholder="StrongPass@123" />

        <label>Role</label>
        <select value={form.role} onChange={e=>setForm(f=>({...f, role:e.target.value}))}>
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
          <option value="OWNER">OWNER</option>
        </select>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">Create</button>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </Modal>
  )
})

/** ---------- Create Store Modal (owners dropdown) ---------- */
const CreateStoreModal = React.memo(function CreateStoreModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({ name:'', email:'', address:'', ownerId:'' })
  const [msg, setMsg] = useState({ ok:'', err:'' })
  const [owners, setOwners] = useState([])
  const [loadingOwners, setLoadingOwners] = useState(false)

  React.useEffect(() => {
    async function loadOwners() {
      try {
        setLoadingOwners(true)
        const res = await api('/api/admin/users?role=OWNER&limit=200&sortBy=name&order=ASC', { token: getToken() })
        setOwners(res.items || [])
      } catch { setOwners([]) }
      finally { setLoadingOwners(false) }
    }
    if (open) {
      setForm({ name:'', email:'', address:'', ownerId:'' })
      setMsg({ ok:'', err:'' })
      loadOwners()
    }
  }, [open])

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim())
  const validate = () => {
    const { name, email, address } = form
    if (!name || !name.trim()) return 'Store name is required.'
    if (!isValidEmail(email)) return 'Invalid store email.'
    if (address && address.length > 400) return 'Address max 400 characters.'
    return ''
  }

  async function submit(e){
    e.preventDefault()
    setMsg({ok:'', err:''})
    const err = validate()
    if (err) return setMsg({ok:'', err})
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
      }
      if (form.ownerId) payload.ownerId = Number(form.ownerId)
      await api('/api/admin/stores', { method:'POST', token:getToken(), body: payload })
      setMsg({ ok:'Store created successfully.', err:'' })
      onCreated?.()
      setTimeout(onClose, 450)
    } catch(e){ setMsg({ok:'', err: e.message}) }
  }

  return (
    <Modal open={open} title="Create New Store" onClose={onClose}>
      {msg.err && <div className="banner error">{msg.err}</div>}
      {msg.ok && <div className="banner success">{msg.ok}</div>}
      <form onSubmit={submit} className="form-grid">
        <label>Store Name</label>
        <input value={form.name} onChange={e=>setForm(f=>({...f, name:e.target.value}))} placeholder="e.g., Fresh Mart" />

        <label>Store Email</label>
        <input value={form.email} onChange={e=>setForm(f=>({...f, email:e.target.value}))} placeholder="store@example.com" />

        <label>Address (≤400)</label>
        <input value={form.address} onChange={e=>setForm(f=>({...f, address:e.target.value}))} placeholder="Street, City, State" />

        <label>Owner</label>
        {loadingOwners ? (
          <div className="muted">Loading owners…</div>
        ) : (
          <select value={form.ownerId} onChange={e=>setForm(f=>({...f, ownerId:e.target.value}))}>
            <option value="">— No owner —</option>
            {owners.map(o => (
              <option key={o.id} value={o.id}>{o.name} ({o.email})</option>
            ))}
          </select>
        )}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">Create</button>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </Modal>
  )
})

/** ---------- Main Admin Dashboard ---------- */
export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState({ items: [], total: 0 })
  const [stores, setStores] = useState({ items: [], total: 0 })
  const [filters, setFilters] = useState({ name:'', email:'', address:'', role:'' })

  const [userSort, setUserSort] = useState({ sortBy: 'name', order: 'ASC' })
  const [storeSort, setStoreSort] = useState({ sortBy: 'name', order: 'ASC' })

  const [openUserModal, setOpenUserModal] = useState(false)
  const [openStoreModal, setOpenStoreModal] = useState(false)

  const loadStats = async () => setStats(await api('/api/admin/stats', { token: getToken() }))
  const loadUsers = async () => {
    const q = new URLSearchParams(Object.entries(filters).filter(([k,v])=>v))
    q.set('sortBy', userSort.sortBy); q.set('order', userSort.order)
    setUsers(await api(`/api/admin/users?${q.toString()}`, { token: getToken() }))
  }
  const loadStores = async () => {
    const q = new URLSearchParams(Object.entries(filters).filter(([k,v])=>k!=='role' && v))
    q.set('sortBy', storeSort.sortBy); q.set('order', storeSort.order)
    setStores(await api(`/api/admin/stores?${q.toString()}`, { token: getToken() }))
  }

  React.useEffect(()=>{ (async()=>{ await loadStats(); await loadUsers(); await loadStores(); })() }, [])
  React.useEffect(()=>{ loadUsers() }, [userSort.sortBy, userSort.order])
  React.useEffect(()=>{ loadStores() }, [storeSort.sortBy, storeSort.order])

  const toggleUserSort = (col) => setUserSort(s => ({ sortBy: col, order: s.sortBy === col && s.order === 'ASC' ? 'DESC' : 'ASC' }))
  const toggleStoreSort = (col) => setStoreSort(s => ({ sortBy: col, order: s.sortBy === col && s.order === 'ASC' ? 'DESC' : 'ASC' }))
  const SortHint = ({active, order}) => <span className="sort-hint">{active ? (order === 'ASC' ? '▲' : '▼') : ''}</span>

  const applyFilters = async () => { await loadUsers(); await loadStores() }

  const onUserCreated = useMemo(()=>()=>{ loadUsers(); loadStats() }, [])
  const onStoreCreated = useMemo(()=>()=>{ loadStores(); loadStats() }, [])

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h2>Admin Dashboard</h2>
        <p className="sub">Manage users, stores, and see platform metrics.</p>
      </div>

      {/* Totals */}
      {stats && (
        <div className="stats">
          <div className="stat-card">
            <div className="label">Users</div>
            <div className="value">{stats.users}</div>
          </div>
          <div className="stat-card">
            <div className="label">Stores</div>
            <div className="value">{stats.stores}</div>
          </div>
          <div className="stat-card">
            <div className="label">Ratings</div>
            <div className="value">{stats.ratings}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <section className="card">
        <div className="card-head">
          <h3>Filters</h3>
          <button className="btn" onClick={applyFilters}>Apply</button>
        </div>
        <div className="filters">
          <input placeholder="Name" value={filters.name} onChange={e=>setFilters(f=>({...f, name:e.target.value}))} />
          <input placeholder="Email" value={filters.email} onChange={e=>setFilters(f=>({...f, email:e.target.value}))} />
          <input placeholder="Address" value={filters.address} onChange={e=>setFilters(f=>({...f, address:e.target.value}))} />
          <select value={filters.role} onChange={e=>setFilters(f=>({...f, role:e.target.value}))}>
            <option value="">Any role</option>
            <option value="ADMIN">ADMIN</option>
            <option value="OWNER">OWNER</option>
            <option value="USER">USER</option>
          </select>
        </div>
      </section>

      {/* Users */}
      <section className="card">
        <div className="card-head">
          <h3>Users</h3>
          <button className="btn btn-primary" onClick={()=>setOpenUserModal(true)}>+ New User</button>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <Th onClick={()=>toggleUserSort('name')} active={userSort.sortBy==='name'} order={userSort.order}>Name</Th>
                <Th onClick={()=>toggleUserSort('email')} active={userSort.sortBy==='email'} order={userSort.order}>Email</Th>
                <Th onClick={()=>toggleUserSort('address')} active={userSort.sortBy==='address'} order={userSort.order}>Address</Th>
                <Th onClick={()=>toggleUserSort('role')} active={userSort.sortBy==='role'} order={userSort.order}>Role</Th>
              </tr>
            </thead>
            <tbody>
              {users.items.map(u => (
                <tr key={u.id} className="row">
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td className="muted">{u.address}</td>
                  <td>{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Stores */}
      <section className="card">
        <div className="card-head">
          <h3>Stores</h3>
          <button className="btn btn-primary" onClick={()=>setOpenStoreModal(true)}>+ New Store</button>
        </div>
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <Th onClick={()=>toggleStoreSort('name')} active={storeSort.sortBy==='name'} order={storeSort.order}>Name</Th>
                <Th onClick={()=>toggleStoreSort('email')} active={storeSort.sortBy==='email'} order={storeSort.order}>Email</Th>
                <Th onClick={()=>toggleStoreSort('address')} active={storeSort.sortBy==='address'} order={storeSort.order}>Address</Th>
                <Th onClick={()=>toggleStoreSort('rating')} active={storeSort.sortBy==='rating'} order={storeSort.order}>Rating</Th>
                <Th>Ratings Count</Th>
              </tr>
            </thead>
            <tbody>
              {stores.items.map(s => (
                <tr key={s.id} className="row">
                  <td>{s.name}</td>
                  <td>{s.email}</td>
                  <td className="muted">{s.address}</td>
                  <td className="num">{s.rating?.toFixed ? s.rating.toFixed(2) : '–'}</td>
                  <td className="num">{s.ratingCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modals */}
      <CreateUserModal open={openUserModal} onClose={()=>setOpenUserModal(false)} onCreated={onUserCreated} />
      <CreateStoreModal open={openStoreModal} onClose={()=>setOpenStoreModal(false)} onCreated={onStoreCreated} />
    </div>
  )

  function Th({ children, onClick, active, order }) {
    return (
      <th onClick={onClick} className={`th ${onClick ? 'th-sortable' : ''}`}>
        <span className="th-label">
          {children}
          <SortHint active={active} order={order} />
        </span>
      </th>
    )
  }
}
