import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import App from './App.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Stores from './pages/Stores.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import OwnerDashboard from './pages/OwnerDashboard.jsx'
import ChangePassword from './pages/ChangePassword.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Navigate to="/stores" />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="stores" element={<Stores />} />
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="owner" element={<OwnerDashboard />} />
        <Route path="change-password" element={<ChangePassword />} />
      </Route>
    </Routes>
  </BrowserRouter>
)
