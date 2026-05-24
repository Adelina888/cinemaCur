import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export const Menu = () => {
  const { isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!isAuthenticated) return null

  return (
    <nav style={{ background: '#333', padding: '10px', marginBottom: '20px', display: 'flex', gap: '15px', alignItems: 'center' }}>
      <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none' }}>Главная</Link>
      <Link to="/products" style={{ color: 'white', textDecoration: 'none' }}>Товары бара</Link>
      <Link to="/merchandise" style={{ color: 'white', textDecoration: 'none' }}>Мерчендайз</Link>
      <button onClick={handleLogout} style={{ marginLeft: 'auto', background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>
        Выйти
      </button>
      
    </nav>
  )
}