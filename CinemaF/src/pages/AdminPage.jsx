import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { AuthApi } from '../services/AuthApi'

export const AdminPage = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [profile, setProfile] = useState({
    fullName: '',
    login: '',
    role: ''
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const data = await AuthApi.getProfile()
      setProfile(data)
    } catch (error) {
      console.error('Ошибка загрузки профиля', error)
    }
  }

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 3000)
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    
    if (!oldPassword) {
      showMessage('Введите текущий пароль', 'error')
      return
    }
    if (!newPassword) {
      showMessage('Введите новый пароль', 'error')
      return
    }
    if (newPassword.length < 4) {
      showMessage('Новый пароль должен содержать минимум 4 символа', 'error')
      return
    }
    if (newPassword !== confirmPassword) {
      showMessage('Новый пароль и подтверждение не совпадают', 'error')
      return
    }
    if (oldPassword === newPassword) {
      showMessage('Новый пароль должен отличаться от текущего', 'error')
      return
    }

    setLoading(true)
    try {
      await AuthApi.changePassword(oldPassword, newPassword)
      showMessage('Пароль успешно изменён!', 'success')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      const message = error.response?.data?.message || 'Ошибка смены пароля'
      showMessage(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Профиль</h1>
      </div>

      {message.text && (
        <div className="card" style={{ 
          background: message.type === 'success' ? '#c6f6d5' : '#fed7d7',
          borderColor: message.type === 'success' ? '#9ae6b4' : '#feb2b2',
          marginBottom: '20px'
        }}>
          <div className="card-body" style={{ textAlign: 'center', color: message.type === 'success' ? '#22543d' : '#742a2a' }}>
            {message.text}
          </div>
        </div>
      )}

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h3>Информация об аккаунте</h3>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label>ФИО</label>
              <div className="form-input" style={{ background: '#f7fafc' }}>
                {profile.fullName || (user?.fullName) || 'Не указано'}
              </div>
            </div>
            <div className="form-group">
              <label>Логин</label>
              <div className="form-input" style={{ background: '#f7fafc' }}>
                {profile.login || user?.login}
              </div>
            </div>
            <div className="form-group">
              <label>Роль</label>
              <div className="form-input" style={{ background: '#f7fafc' }}>
                <span className="status status-info">{profile.role || 'Администратор'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Смена пароля</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label>Текущий пароль</label>
                <input
                  type="password"
                  className="form-input"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Введите текущий пароль"
                  required
                />
              </div>
              <div className="form-group">
                <label>Новый пароль</label>
                <input
                  type="password"
                  className="form-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Минимум 4 символа"
                  required
                />
              </div>
              <div className="form-group">
                <label>Подтверждение пароля</label>
                <input
                  type="password"
                  className="form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Повторите новый пароль"
                  required
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading}
                style={{ width: '100%' }}
              >
                {loading ? 'Сохранение...' : 'Изменить пароль'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}