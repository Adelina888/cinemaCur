import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export const Menu = () => {
  const { isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  if (!isAuthenticated) return null

  const menuItems = [
    { path: '/dashboard', label: 'Главная' },
    { path: '/products', label: 'Товары' },
    { path: '/merchandise', label: 'Мерч' },
    { path: '/combos', label: 'Комбо' },
    { path: '/remains', label: 'Остатки' },
    { path: '/receipts', label: 'Продажи' },
    { path: '/reports', label: 'Отчёты' },
  ]

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/dashboard" className="logo">Cinema </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <ul className="nav-links">
            {menuItems.map(item => (
              <li key={item.path}>
                <Link to={item.path} className={location.pathname === item.path ? 'active' : ''}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <button onClick={() => { logout(); navigate('/login'); }} className="logout-btn">
            Выйти
          </button>
        </div>
      </div>
    </nav>
  )
}