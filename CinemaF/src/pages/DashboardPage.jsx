// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { AuthApi } from '../services/AuthApi'

export const DashboardPage = () => {
  const { user: authUser, token } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await AuthApi.getProfile()
        setProfile(data)
      } catch (error) {
        console.error('Ошибка загрузки профиля', error)
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <h1 style={titleStyle}>Панель управления</h1>
          <p style={textStyle}>Загрузка...</p>
        </div>
      </div>
    )
  }

 
  const userName = profile?.fullName || authUser?.fullName || authUser?.login 

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