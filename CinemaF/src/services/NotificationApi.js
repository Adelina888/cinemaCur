import api from './axiosConfig'

export const NotificationApi = {
  getNotifications: async () => {
    const response = await api.get('/notifications')
    return response.data
  }
}