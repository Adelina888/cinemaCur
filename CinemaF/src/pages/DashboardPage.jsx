import React, { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { NotificationApi } from '../services/NotificationApi'
import { AuthApi } from '../services/AuthApi'

export const DashboardPage = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    loadProfile()
    loadNotifications()
    const interval = setInterval(loadNotifications, 5 * 60 * 1000)
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadProfile = async () => {
    try {
      const data = await AuthApi.getProfile()
      setProfile(data)
    } catch (error) {
      console.error('Ошибка загрузки профиля', error)
      if (user) {
        setProfile({ fullName: user.fullName, login: user.login })
      }
    }
  }

  const loadNotifications = async () => {
    try {
      const data = await NotificationApi.getNotifications()
      setNotifications(data)
      
      if (data.expiredProducts && data.expiredProducts.length > 0) {
        alert(`ВНИМАНИЕ! Просрочены товары: ${data.expiredProducts.join(', ')}`)
      }
    } catch (error) {
      console.error('Ошибка загрузки уведомлений', error)
    } finally {
      setLoading(false)
    }
  }

  // Получаем имя для приветствия
  const getUserName = () => {
    if (profile?.fullName) return profile.fullName
    if (user?.fullName) return user.fullName
    if (profile?.login) return profile.login
    if (user?.login) return user.login
    return 'Администратор'
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <h1>Панель управления</h1>
      <p>Добро пожаловать, {getUserName()}!</p>
      
      {/* Блок уведомлений */}
      {!loading && notifications && (
        <div style={{ marginTop: 30 }}>
          <h2> Уведомления</h2>
          
          {/* Просроченные товары - красный блок */}
          {notifications.expiredProducts?.length > 0 && (
            <div style={{
              background: '#fee',
              borderLeft: '4px solid #dc3545',
              padding: 15,
              marginBottom: 15,
              borderRadius: 8
            }}>
              <h3 style={{ color: '#dc3545', margin: '0 0 10px 0' }}> Просроченные товары</h3>
              <ul style={{ margin: 0 }}>
                {notifications.expiredProducts.map((name, idx) => (
                  <li key={idx}>{name}</li>
                ))}
              </ul>
              <p style={{ marginTop: 10, fontSize: 14, color: '#666' }}>
                 Продажа этих товаров автоматически заблокирована
              </p>
            </div>
          )}
          
          {/* Истекающие товары - оранжевый блок */}
          {notifications.expiringSoonProducts?.length > 0 && (
            <div style={{
              background: '#fff3e0',
              borderLeft: '4px solid #ff9800',
              padding: 15,
              marginBottom: 15,
              borderRadius: 8
            }}>
              <h3 style={{ color: '#ff9800', margin: '0 0 10px 0' }}> Срок годности истекает</h3>
              <ul style={{ margin: 0 }}>
                {notifications.expiringSoonProducts.map((name, idx) => (
                  <li key={idx}>{name}</li>
                ))}
              </ul>
              <p style={{ marginTop: 10, fontSize: 14, color: '#666' }}>
                 Рекомендуем продать или переместить эти товары в ближайшее время
              </p>
            </div>
          )}
          
          {/* Низкие остатки - синий блок */}
          {notifications.lowStockProducts?.length > 0 && (
            <div style={{
              background: '#e3f2fd',
              borderLeft: '4px solid #2196f3',
              padding: 15,
              marginBottom: 15,
              borderRadius: 8
            }}>
              <h3 style={{ color: '#2196f3', margin: '0 0 10px 0' }}> Низкие остатки</h3>
              <ul style={{ margin: 0 }}>
                {notifications.lowStockProducts.map((name, idx) => (
                  <li key={idx}>{name}</li>
                ))}
              </ul>
              <p style={{ marginTop: 10, fontSize: 14, color: '#666' }}>
                 Необходимо пополнить запасы
              </p>
            </div>
          )}
          
          {/* Если нет уведомлений */}
          {(notifications.expiredProducts?.length === 0 || !notifications.expiredProducts) && 
           (notifications.expiringSoonProducts?.length === 0 || !notifications.expiringSoonProducts) && 
           (notifications.lowStockProducts?.length === 0 || !notifications.lowStockProducts) && (
            <div style={{
              background: '#e8f5e9',
              borderLeft: '4px solid #4caf50',
              padding: 15,
              borderRadius: 8
            }}>
              <p style={{ margin: 0, color: '#2e7d32' }}> Все хорошо! Нет критических уведомлений.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}