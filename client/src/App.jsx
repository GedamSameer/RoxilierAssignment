import React from 'react'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { getUser, logout } from './auth.js'
import './app.css'

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = getUser()

  function doLogout() {
    logout()
    navigate('/login')
  }

  // check which path is active
  const isLoginActive = location.pathname === '/login'
  const isSignupActive = location.pathname === '/signup'

  return (
    <div className="app-root">
      <nav className="nav">
        {/* Left side */}
        <div className="nav-left">
          <Link to="/stores" className="nav-link nav-link-strong">Available Stores</Link>
          {user?.role === 'ADMIN' && <Link to="/admin" className="nav-link">Admin</Link>}
          {user?.role === 'OWNER' && <Link to="/owner" className="nav-link">Owner</Link>}
        </div>

        {/* Right side */}
        <div className="nav-right">
          {user ? (
            <>
              <Link to="/change-password" className="nav-link">Change Password</Link>
              <button onClick={doLogout} className="btn btn-ghost">Logout</button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`btn ${isLoginActive ? 'btn-primary' : 'btn-ghost'}`}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className={`btn ${isSignupActive ? 'btn-primary' : 'btn-ghost'}`}
              >
                Signup
              </Link>
            </>
          )}
        </div>
      </nav>

      <main className="page">
        <Outlet />
      </main>
    </div>
  )
}
