import React from 'react'
import { useAuth } from '../hooks/useAuth'

export const DashboardPage = () => {
  const { user } = useAuth()

  return (
    <div>
      <h1>Панель управления</h1>
      <p>Добро пожаловать, {user?.fullName || user?.login}!</p>
      <p>Выберите раздел в меню для работы.</p>
    </div>
  )
}