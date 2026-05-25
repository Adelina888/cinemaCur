// src/pages/DashboardPage.jsx
import React from 'react'
import { useAuth } from '../hooks/useAuth'

export const DashboardPage = () => {
  const { user } = useAuth()

  // Если пользователь ещё не загрузился
  if (!user) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <h1 style={titleStyle}>Панель управления</h1>
          <p style={textStyle}>Загрузка данных пользователя...</p>
        </div>
      </div>
    )
  }

  // Берём имя из любого возможного поля (универсально)
  const userName = user.fullName || user.name || user.username || user.login || user.email || 'Пользователь'

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>Панель управления</h1>
        <p style={textStyle}>
          Добро пожаловать, <strong>{userName}</strong>!
        </p>
      </div>
    </div>
  )
}

// Стили вынесены отдельно, чтобы не загромождать JSX
const containerStyle = {
  maxWidth: '1400px',
  margin: '0 auto',
  padding: '24px',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  backgroundColor: '#f8fafc',
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
}

const cardStyle = {
  backgroundColor: '#fff',
  borderRadius: '12px',
  padding: '40px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  border: '1px solid #e2e8f0',
  textAlign: 'center',
  width: '100%',
  maxWidth: '600px'
}

const titleStyle = {
  fontSize: '28px',
  fontWeight: '700',
  color: '#1e293b',
  margin: '0 0 12px 0'
}

const textStyle = {
  fontSize: '16px',
  color: '#475569',
  margin: 0
}