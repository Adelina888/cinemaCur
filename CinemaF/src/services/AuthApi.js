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
}