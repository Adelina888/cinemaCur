import api from './axiosConfig'

export const AuthApi = {
  login: async (login, password) => {
    const response = await api.post('/auth/login', { login, password })
    return response.data
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/profile')
    return response.data
  },
  
  changePassword: async (oldPassword, newPassword) => {
    const response = await api.post('/auth/change-password', { oldPassword, newPassword })
    return response.data
  },
}