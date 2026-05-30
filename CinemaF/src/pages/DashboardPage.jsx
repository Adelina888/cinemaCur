import React, { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../hooks/useAuth'
import { NotificationApi } from '../services/NotificationApi'
import { AuthApi } from '../services/AuthApi'
import './DashboardPage.css'

export const DashboardPage = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const [readNotifications, setReadNotifications] = useState([])

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

  const getUserName = () => {
    if (profile?.fullName) return profile.fullName
    if (user?.fullName) return user.fullName
    if (profile?.login) return profile.login
    if (user?.login) return user.login
    return 'Администратор'
  }

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications)
  }

  const markAsRead = (notificationKey) => {
    if (!readNotifications.includes(notificationKey)) {
      setReadNotifications([...readNotifications, notificationKey])
    }
  }

  const markAllAsRead = () => {
    const allKeys = []
    if (notifications?.expiredProducts?.length) {
      allKeys.push('expired')
    }
    if (notifications?.expiringSoonProducts?.length) {
      allKeys.push('expiring')
    }
    if (notifications?.lowStockProducts?.length) {
      allKeys.push('lowStock')
    }
    setReadNotifications(allKeys)
  }

  const getUnreadCount = () => {
    if (!notifications) return 0
    let count = 0
    if (notifications.expiredProducts?.length && !readNotifications.includes('expired')) {
      count++
    }
    if (notifications.expiringSoonProducts?.length && !readNotifications.includes('expiring')) {
      count++
    }
    if (notifications.lowStockProducts?.length && !readNotifications.includes('lowStock')) {
      count++
    }
    return count
  }

  const handleClickOutside = useCallback((e) => {
    if (showNotifications && !e.target.closest('.dashboard__notifications-container')) {
      setShowNotifications(false)
    }
  }, [showNotifications])

  useEffect(() => {
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [handleClickOutside])

  const getVisibleNotifications = () => {
    if (!notifications) return []
    const visible = []
    
    if (notifications.expiredProducts?.length > 0 && !readNotifications.includes('expired')) {
      visible.push({
        type: 'expired',
        title: 'Просроченные товары',
        items: notifications.expiredProducts,
        color: 'danger',
        hint: 'Продажа заблокирована'
      })
    }
    
    if (notifications.expiringSoonProducts?.length > 0 && !readNotifications.includes('expiring')) {
      visible.push({
        type: 'expiring',
        title: 'Срок годности истекает',
        items: notifications.expiringSoonProducts,
        color: 'warning',
        hint: 'Рекомендуем продать в ближайшее время'
      })
    }
    
    if (notifications.lowStockProducts?.length > 0 && !readNotifications.includes('lowStock')) {
      visible.push({
        type: 'lowStock',
        title: 'Низкие остатки',
        items: notifications.lowStockProducts,
        color: 'info',
        hint: 'Необходимо пополнить запасы'
      })
    }
    
    return visible
  }

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1 className="dashboard__title">Панель управления</h1>
        
        <div className="dashboard__header-right">
          <div className="dashboard__notifications-container">
            <button 
              className="dashboard__bell"
              onClick={toggleNotifications}
            >
              🔔
              {getUnreadCount() > 0 && (
                <span className="dashboard__bell-badge">
                  {getUnreadCount()}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="dashboard__notifications-dropdown">
                <div className="dashboard__notifications-header">
                  <h3>Уведомления</h3>
                  {getUnreadCount() > 0 && (
                    <button 
                      className="dashboard__mark-all-btn"
                      onClick={markAllAsRead}
                    >
                      Прочитать всё
                    </button>
                  )}
                </div>
                
                <div className="dashboard__notifications-list">
                  {!loading && getVisibleNotifications().length > 0 ? (
                    getVisibleNotifications().map((notification, idx) => (
                      <div 
                        key={idx}
                        className={`dashboard__notification-item dashboard__notification-item--${notification.color}`}
                        onClick={() => markAsRead(notification.type)}
                      >
                        <div className="dashboard__notification-icon">{notification.icon}</div>
                        <div className="dashboard__notification-content">
                          <div className="dashboard__notification-title">
                            {notification.title}
                          </div>
                          <div className="dashboard__notification-message">
                            {notification.items.join(', ')}
                          </div>
                          <div className="dashboard__notification-hint">
                            {notification.hint}
                          </div>
                        </div>
                        <div className="dashboard__notification-arrow">▼</div>
                      </div>
                    ))
                  ) : (
                    <div className="dashboard__notification-empty">
                      {loading ? (
                        <div>Загрузка уведомлений...</div>
                      ) : (
                        <>
                          <div className="dashboard__notification-empty-icon">✅</div>
                          <div>Нет непрочитанных уведомлений</div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="dashboard__user">
            <span className="dashboard__user-name">{getUserName()}</span>
            <div className="dashboard__user-avatar">
              {getUserName().charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
      
      <div className="dashboard__welcome">
        <p>Добро пожаловать, {getUserName()}!</p>
      </div>
      
      {!loading && notifications && getUnreadCount() === 0 && (
        <div className="dashboard__success-card">
          <p>Все системы работают нормально. Нет критических уведомлений.</p>
        </div>
      )}
    </div>
  )
}