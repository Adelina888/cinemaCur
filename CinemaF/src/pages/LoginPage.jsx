import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export const LoginPage = () => {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login: authLogin } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authLogin(login, password)
      navigate('/dashboard')
    } catch (err) {
      setError('Неверный логин или пароль', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '8px', textAlign: 'center' }}>Вход в систему</h1>
        <p style={{ color: '#666', fontSize: '14px', textAlign: 'center', marginBottom: '32px' }}>Cinema </p>
        
        {error && (
          <div style={{ background: '#fee', color: '#c62828', padding: '10px', borderRadius: '6px', marginBottom: '20px', fontSize: '13px', textAlign: 'center' }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Логин</label>
            <input type="text" className="form-input" value={login} onChange={(e) => setLogin(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Пароль</label>
            <input type="password" className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '10px' }} disabled={loading}>
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  )
}