import React, { createContext, useState, useEffect } from 'react'
import { AuthApi } from '../services/AuthApi'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const userData = await AuthApi.getCurrentUser()
          setUser(userData)
        } catch (error) {
          console.error('Токен недействителен', error)
          localStorage.removeItem('token')
          setToken(null)
        }
      }
      setLoading(false)
    }
    checkAuth()
  }, [token])

  const login = async (login, password) => {
    const response = await AuthApi.login(login, password)
    localStorage.setItem('token', response.token)
    setToken(response.token)
    setUser({ id: response.adminId, fullName: response.fullName, login: response.login })
    return response
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token, loading }}>
      {children}
    </AuthContext.Provider>
  )
}